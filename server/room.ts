export class Candidate {
  id: string;
  refIds: string[] = [];

  constructor(candiId) {
    this.id = candiId;
  }
  addRef(peerId: string) {
    this.refIds = [ ...this.refIds, peerId];
  }

  disconnectRef(peerId: string) {
    this.refIds = this.refIds.filter((id) => {
      return peerId !== id;
    });
  }
}

export class Room {
  id: string;
  candidates: Candidate[] = [];

  constructor(roomId: string) {
    this.id = roomId;
  }

  getCandidate(id: string) {
    return this.candidates.find((candi) => {
      return candi.id === id;
    });
  }

  getOtherCandi(candiId: string) {
    return this.candidates.filter((candi) => {
      return candi.id !== candiId;
    });
  }

  joinRoom(candiId: string) {
    const aCandi = this.getCandidate(candiId);
    if (aCandi) {
      return aCandi;
    }

    const newCandi = new Candidate(candiId);

    this.candidates.map((candi) => {
      candi.addRef(newCandi.id);
      newCandi.addRef(candi.id);
    });

    this.candidates.push(newCandi);

    return newCandi;
  }

  leaveRoom(candiId: string) {
    this.candidates = this.candidates.filter((candi) => {
      return candi.id !== candiId;
    });

    this.candidates.map((candi) => {
      candi.disconnectRef(candiId);
    });
  }
}

export class RoomFactory {
  rooms: Room[] = [];
  constructor() {
  }

  addRoom(room: Room): void {
    this.rooms.push(room);
  }

  removeRoom(room: Room): void {
    this.rooms = this.rooms.filter((ro) => {
      return ro.id !== room.id;
    });
  }

  addRoomByid(roomId: string) {
    const room = this.findRoom(roomId);

    if (room) {
      return room;
    }

    const ro = new Room(roomId);
    this.rooms.push(ro);

    return ro;
  }

  findRoom(roomId: string) {
    return this.rooms.find((ro) => {
      return ro.id === roomId;
    });
  }
}
