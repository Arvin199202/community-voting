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
    address public owner;
    uint256 public constant NUM_CANDIDATES = 4;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyNonOwner() {
        require(msg.sender != owner, "Only non-owner can call this function");
        _;
    }

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

    struct Proposal {
        string title;
        string description;
        address creator;
        uint256 createdAt;
        bool active;
    }

    Proposal[] public proposals;

    event VoteCast(address indexed voter, uint8 candidate, euint32 encryptedVote);
    event ProposalCreated(uint256 indexed proposalId, address creator, string title);
    event VotingStarted(address indexed starter);

    event VoteCountsUpdated(
        euint32 candidate1Votes,
        euint32 candidate2Votes,
        euint32 candidate3Votes,
        euint32 candidate4Votes,
        euint32 totalVotes
    );

    constructor() {
        owner = msg.sender;
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
    ) external payable {
        require(!hasVoted[msg.sender], "CommunityVoting: already voted");
        require(msg.value == 0, "No payment required for voting");

        euint32 candidate = FHE.fromExternal(encryptedCandidate, inputProof);

        userVotes[msg.sender] = candidate;

        FHE.allow(candidate, msg.sender);
        FHE.allowThis(candidate);

        euint32 one = FHE.asEuint32(1);

        ebool isCandidate1 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_1));
        ebool isCandidate2 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_2));
        ebool isCandidate3 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_3));
        ebool isCandidate4 = FHE.eq(candidate, FHE.asEuint32(CANDIDATE_4));

        voteDataCache.candidate1Votes = FHE.select(isCandidate1,
            FHE.add(voteDataCache.candidate1Votes, one),
            voteDataCache.candidate1Votes
        );
        voteDataCache.candidate2Votes = FHE.select(isCandidate2,
            FHE.add(voteDataCache.candidate2Votes, one),
            voteDataCache.candidate2Votes
        );
        voteDataCache.candidate3Votes = FHE.select(isCandidate3,
            FHE.add(voteDataCache.candidate3Votes, one),
            voteDataCache.candidate3Votes
        );
        voteDataCache.candidate4Votes = FHE.select(isCandidate4,
            FHE.add(voteDataCache.candidate4Votes, one),
            voteDataCache.candidate4Votes
        );

        voteDataCache.totalVotes = FHE.add(voteDataCache.totalVotes, one);

        FHE.allowThis(voteDataCache.candidate1Votes);
        FHE.allowThis(voteDataCache.candidate2Votes);
        FHE.allowThis(voteDataCache.candidate3Votes);
        FHE.allowThis(voteDataCache.candidate4Votes);
        FHE.allowThis(voteDataCache.totalVotes);

        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, 0, candidate);
        emit VoteCountsUpdated(
            voteDataCache.candidate1Votes,
            voteDataCache.candidate2Votes,
            voteDataCache.candidate3Votes,
            voteDataCache.candidate4Votes,
            voteDataCache.totalVotes
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

    function mintVotingTokens(address to, uint256 amount) external {
        require(amount > 0, "Amount must be positive");

        euint32 encryptedAmount = FHE.asEuint32(amount);

        voteData.candidate1Votes = FHE.add(voteData.candidate1Votes, encryptedAmount);
        voteData.candidate2Votes = FHE.add(voteData.candidate2Votes, encryptedAmount);
        voteData.candidate3Votes = FHE.add(voteData.candidate3Votes, encryptedAmount);
        voteData.candidate4Votes = FHE.add(voteData.candidate4Votes, encryptedAmount);

        voteData.totalVotes = FHE.add(voteData.totalVotes, encryptedAmount);

        FHE.allowThis(voteData.candidate1Votes);
        FHE.allowThis(voteData.candidate2Votes);
        FHE.allowThis(voteData.candidate3Votes);
        FHE.allowThis(voteData.candidate4Votes);
        FHE.allowThis(voteData.totalVotes);
    }

    function createProposal(string memory title, string memory description) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(title).length <= 100, "Title too long");
        require(bytes(description).length <= 1000, "Description too long");

        proposals.push(Proposal({
            title: title,
            description: description,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true
        }));

        emit ProposalCreated(proposals.length - 1, msg.sender, title);
    }

    function startVoting() external onlyNonOwner {
        emit VotingStarted(msg.sender);
    }

    function emergencyStop() external onlyOwner {
        for (uint256 i = 0; i < proposals.length; i++) {
            proposals[i].active = false;
        }
    }
}

