pragma solidity ^0.4.6;

contract FoodSafe {

  struct Location {
    string name;
    uint locationId;
    string secret;
    uint prevLocationId;
    uint timestamp;
  }

  mapping(uint8 => Location) trail;

  uint8 trailCount = 0;

  function addNewLocation(string name, uint locationId, string secret) {
    Location memory newLocation;

    newLocation.name = name;
    newLocation.locationId = locationId;
    newLocation.secret = secret;
    newLocation.timestamp = now;
    if (trailCount != 0) {
      newLocation.prevLocationId = trail[trailCount - 1].locationId;
    }

    trail[trailCount] = newLocation;

    trailCount++;
  }

  function getEndLocation(uint8 trailNumber) returns(string, uint, uint, uint, string) {
    return (trail[trailNumber].name, trail[trailNumber].locationId,
      trail[trailNumber].prevLocationId, trail[trailNumber].timestamp,
      trail[trailNumber].secret);
  }

  function getTrailCount() returns(uint8) {
    return trailCount;
  }

}
