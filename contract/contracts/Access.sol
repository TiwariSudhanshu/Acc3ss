// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Access is ERC721, Ownable {

    using Strings for uint256;

    struct Event {
        string name;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 totalTicketsSold;
        string baseURI;
        address organizer;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public tokenToEvent;
    mapping(uint256 => uint256) public eventBalances;

    uint256 public nextEventId;
    uint256 public nextTokenId;

    event TicketMinted(address indexed to, uint256 ticketId);
    event Withdrawal(uint256 amount);
    event EventCreated(uint256 indexed eventId, address indexed organizer, string name);

    constructor() ERC721("Access", "ACC") {}

    function createEvent(
        string memory name,
        uint256 price,
        uint256 maxTickets,
        string memory uri
    ) external {
        require(bytes(name).length > 0, "Event name required");
        require(price > 0, "Price must be greater than 0");
        require(maxTickets > 0, "Max tickets must be greater than 0");
        require(bytes(uri).length > 0, "Base URI required");

        events[nextEventId] = Event({
            name: name,
            ticketPrice: price,
            maxTickets: maxTickets,
            totalTicketsSold: 0,
            baseURI: uri,
            organizer: msg.sender
        });

        emit EventCreated(nextEventId, msg.sender, name);
        nextEventId++;
    }

    function mintTicket(uint256 eventId) external payable {
        Event storage ev = events[eventId];
        require(ev.maxTickets > 0, "Invalid eventId");
        require(msg.value == ev.ticketPrice, "Incorrect ticket price");
        require(ev.totalTicketsSold < ev.maxTickets, "All tickets sold");

        uint256 tokenId = nextTokenId;
        tokenToEvent[tokenId] = eventId;
        ev.totalTicketsSold++;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);
        eventBalances[eventId] += msg.value;

        emit TicketMinted(msg.sender, tokenId);
    }

    function withdrawForEvent(uint256 eventId) external {
        Event storage ev = events[eventId];
        require(msg.sender == ev.organizer, "Not event organizer");

        uint256 balance = eventBalances[eventId];
        require(balance > 0, "No funds to withdraw");

        eventBalances[eventId] = 0;
        payable(msg.sender).transfer(balance);

        emit Withdrawal(balance);
    }

    function setBaseURI(uint256 eventId, string memory newBaseURI) external {
        Event storage ev = events[eventId];
        require(msg.sender == ev.organizer || msg.sender == owner(), "Not authorized");
        ev.baseURI = newBaseURI;
    }

    function availableTickets(uint256 eventId) external view returns (uint256) {
        Event storage ev = events[eventId];
        require(ev.maxTickets > 0, "Event does not exist");
        return ev.maxTickets - ev.totalTicketsSold;
    }

    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        uint256 eventId = tokenToEvent[tokenId];
        return string(abi.encodePacked(events[eventId].baseURI, "/", tokenId.toString(), ".json"));
    }

    receive() external payable {
        revert("Use mintTicket() to mint NFT");
    }
}
