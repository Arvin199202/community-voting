// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {
    FHE,
    ebool,
    euint32,
    externalEuint32
} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract CommunityVoting is SepoliaConfig {
    uint256 public constant NUM_CANDIDATES = 4;

    uint8 public constant CANDIDATE_1 = 0;
    uint8 public constant CANDIDATE_2 = 1;
    uint8 public constant CANDIDATE_3 = 2;
    uint8 public constant CANDIDATE_4 = 3;

    struct VoteData {
        euint32 candidate1Votes;
        euint32 candidate2Votes;
        euint32 candidate3Votes;
        euint32 candidate4Votes;
        euint32 totalVotes;
    }

    VoteData public voteData;

    mapping(address => bool) public hasVoted;

    mapping(address => euint32) public userVotes;

    event VoteCast(address indexed voter, uint8 candidate, euint32 encryptedVote);

    event VoteCountsUpdated(
        euint32 candidate1Votes,
        euint32 candidate2Votes,
        euint32 candidate3Votes,
        euint32 candidate4Votes,
        euint32 totalVotes
    );

    constructor() {
        voteData.candidate1Votes = FHE.asEuint32(0);
        voteData.candidate2Votes = FHE.asEuint32(0);
        voteData.candidate3Votes = FHE.asEuint32(0);
        voteData.candidate4Votes = FHE.asEuint32(0);
        voteData.totalVotes = FHE.asEuint32(0);

        FHE.allowThis(voteData.candidate1Votes);
        FHE.allowThis(voteData.candidate2Votes);
        FHE.allowThis(voteData.candidate3Votes);
        FHE.allowThis(voteData.candidate4Votes);
        FHE.allowThis(voteData.totalVotes);
    }

    function vote(
        externalEuint32 encryptedCandidate,
        bytes calldata inputProof
    ) external {
        require(!hasVoted[msg.sender], "CommunityVoting: already voted");

        euint32 candidate = FHE.fromExternal(encryptedCandidate, inputProof);

        userVotes[msg.sender] = candidate;

        FHE.allow(candidate, msg.sender);
        FHE.allowThis(candidate);

        euint32 one = FHE.asEuint32(1);

        ebool isCandidate1 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_1));
        ebool isCandidate2 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_2));
        ebool isCandidate3 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_3));
        ebool isCandidate4 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_4));

        voteData.candidate1Votes = FHE.select(isCandidate1,
            FHE.add(voteData.candidate1Votes, one),
            voteData.candidate1Votes
        );
        voteData.candidate2Votes = FHE.select(isCandidate2,
            FHE.add(voteData.candidate2Votes, one),
            voteData.candidate2Votes
        );
        voteData.candidate3Votes = FHE.select(isCandidate3,
            FHE.add(voteData.candidate3Votes, one),
            voteData.candidate3Votes
        );
        voteData.candidate4Votes = FHE.select(isCandidate4,
            FHE.add(voteData.candidate4Votes, one),
            voteData.candidate4Votes
        );

        voteData.totalVotes = FHE.add(voteData.totalVotes, one);

        FHE.allowThis(voteData.candidate1Votes);
        FHE.allowThis(voteData.candidate2Votes);
        FHE.allowThis(voteData.candidate3Votes);
        FHE.allowThis(voteData.candidate4Votes);
        FHE.allowThis(voteData.totalVotes);

        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, 0, candidate);
        emit VoteCountsUpdated(
            voteData.candidate1Votes,
            voteData.candidate2Votes,
            voteData.candidate3Votes,
            voteData.candidate4Votes,
            voteData.totalVotes
        );
    }

    function getVoteCounts() external view returns (
        euint32 candidate1Votes,
        euint32 candidate2Votes,
        euint32 candidate3Votes,
        euint32 candidate4Votes,
        euint32 totalVotes
    ) {
        return (
            voteData.candidate1Votes,
            voteData.candidate2Votes,
            voteData.candidate3Votes,
            voteData.candidate4Votes,
            voteData.totalVotes
        );
    }

    function getUserVote(address voter) external view returns (euint32) {
        return userVotes[voter];
    }

    function checkHasVoted(address voter) external view returns (bool) {
        return hasVoted[voter];
    }

    function authorizeUserForDecryption(address user) external {
        FHE.allow(voteData.candidate1Votes, user);
        FHE.allow(voteData.candidate2Votes, user);
        FHE.allow(voteData.candidate3Votes, user);
        FHE.allow(voteData.candidate4Votes, user);
        FHE.allow(voteData.totalVotes, user);
    }
}

