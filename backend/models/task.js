const { v4: uuid } = require("uuid");

// Repræsenterer én opgave i systemet
class Task {
    constructor(data = {}) {
        this.id = data.id || uuid();        // Unik ID
        this.titel = data.titel || "";
        this.beskrivelse = data.beskrivelse || "";
        this.type = data.type || "";
        this.zone = data.zone || "";
        this.radius = data.radius || null;
        this.latitude = data.latitude || null;
        this.longitude = data.longitude || null;
        this.options = data.options || [];
        this.activationCondition = data.activationCondition || "";
        this.activated = false;
        this.completed = false;
        this.difficulty = data.difficulty || "";
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

module.exports = Task;
