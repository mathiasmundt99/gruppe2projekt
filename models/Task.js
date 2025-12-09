const { v4: uuid } = require("uuid");

class Task {
    constructor(data = {}) {
        this.id = data.id || uuid();
        this.titel = data.titel || "";
        this.beskrivelse = data.beskrivelse || "";
        this.type = data.type || "";
        this.zone = data.zone || "";
        this.radius = data.radius || null;
        this.latitude = data.latitude || null;
        this.longitude = data.longitude || null;
        this.options = data.options || [];
        this.activationCondition = data.activationCondition || "";
        this.activated = data.activated || false;
        this.completed = data.completed || false;
        this.difficulty = data.difficulty || "";
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = new Date();
    }
}

module.exports = Task;
