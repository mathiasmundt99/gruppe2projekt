class Task {
    constructor({
        ID = 0,
        Title = "",
        Description = "",
        Type = "",
        Location = "",
        Radius = null,
        Options = "",
        ActivationCondition = "",
        Activated = false,
        Completed = false,
        Difficulty = null,
        Latitude = null,
        Longitude = null
    }) {
        this.ID = Number(ID);
        this.Title = Title;
        this.Description = Description;
        this.Type = Type;
        this.Location = Location;
        this.Radius = Radius !== "" ? Number(Radius) : null;
        this.Options = Options;
        this.ActivationCondition = ActivationCondition;
        this.Activated = Activated === true || Activated === "true";
        this.Completed = Completed === true || Completed === "true";
        this.Difficulty = Difficulty !== "" ? Number(Difficulty) : null;
        this.Latitude = Latitude !== "" ? Number(Latitude) : null;
        this.Longitude = Longitude !== "" ? Number(Longitude) : null;
    }

    // metode der bruges når vi eksporterer til Team 2 og 3
    toSharedJSON() {
        return {
            id: this.ID,
            titel: this.Title,
            beskrivelse: this.Description,
            type: this.Type,
            lokation: {
                tekst: this.Location,
                latitude: this.Latitude,
                longitude: this.Longitude,
                radius: this.Radius
            }
        };
    }

    // Eks. fremtidige metoder:
    isActive() {
        return this.Activated === true && this.Completed === false;
    }
}

module.exports = Task;
