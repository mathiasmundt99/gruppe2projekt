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
        this.Radius = Radius !== "" && !isNaN(Number(Radius)) ? Number(Radius) : null;

        // Options kommer fra Excel eller frontend som én streng: "Start;Stop;Læs videre"
        // Den splittes op til et array: ["Start", "Stop", "Læs videre"]
        this.Options = typeof Options === "string"
            ? Options.split(";").map(o => o.trim()).filter(o => o.length > 0)
            : [];
        this.ActivationCondition = ActivationCondition;
        this.Activated = Activated === true || Activated === "true";
        this.Completed = Completed === true || Completed === "true";
        this.Difficulty = String(Difficulty || "");
        // Hvis (Latitude ikke er tom OG Latitude kan blive et tal) så gem Latitude som et TAL ellers gem null
        this.Latitude = Latitude !== "" && !isNaN(Number(Latitude)) ? Number(Latitude) : null;
        this.Longitude = Longitude !== "" && !isNaN(Number(Longitude)) ? Number(Longitude) : null;
    }

    // metode der bruges når vi eksporterer til Team 2 og 3
    toSharedJSON() {
        try {
            return {
                id: this.ID,
                title: this.Title,
                description: this.Description,
                type: this.Type,
                location: this.Location,
                radius: this.Radius,
                options: [...this.Options],
                activationCondition: this.ActivationCondition,
                activated: this.Activated,
                completed: this.Completed,
                difficulty: this.Difficulty,
                latitude: this.Latitude,
                longitude: this.Longitude
            };

        } catch (error) {
            console.error("Fejl ved eksport af Task", error.message)
        }
    }

}

module.exports = Task;
