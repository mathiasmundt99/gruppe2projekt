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
        // Options skal altid være et array
        if (typeof Options === "string") {
            this.Options = Options
                .split(";")
                .map(o => o.trim())
                .filter(o => o.length > 0);
        } else if (Array.isArray(Options)) {
            this.Options = Options;
        } else {
            this.Options = [];
        }
        this.ActivationCondition = ActivationCondition;
        this.Activated = Activated === true || Activated === "true";
        this.Completed = Completed === true || Completed === "true";
        this.Difficulty = String(Difficulty || "");
        this.Latitude = Latitude !== "" ? Number(Latitude) : null;
        this.Longitude = Longitude !== "" ? Number(Longitude) : null;
    }

    // metode der bruges når vi eksporterer til Team 2 og 3
    toSharedJSON() {
        return {
            id: this.ID,
            title: this.Title,
            description: this.Description,
            type: this.Type,
            location: this.Location,
            radius: this.Radius,
            options: this.Options,
            activationCondition: this.ActivationCondition,
            activated: this.Activated,
            completed: this.Completed,
            difficulty: this.Difficulty,
            latitude: this.Latitude,
            longitude: this.Longitude
        };
    }


    // Eks. fremtidige metoder:
    isActive() {
        return this.Activated === true && this.Completed === false;
    }
}

module.exports = Task;
