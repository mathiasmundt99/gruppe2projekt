// Dette er en klasse der repræsenterer en opgave.
// Vi bruger objektorienteret programmering for at gøre
// datastrukturen tydelig og let at udvide.

class Task {
    constructor(data) {
        this.id = Number(data.id);
        this.titel = data.titel || "";
        this.beskrivelse = data.beskrivelse || "";
        this.type = data.type || "";
        this.zone = data.zone || "";
        this.radius = data.radius ? Number(data.radius) : null;
        this.latitude = data.latitude ? Number(data.latitude) : null;
        this.longitude = data.longitude ? Number(data.longitude) : null;

        // options kan være array eller semikolon-separeret tekst
        this.options = Array.isArray(data.options)
            ? data.options
            : (data.options || "").split(";").filter(x => x);

        this.activated = data.activated === true || data.activated === "true";
        this.completed = data.completed === true || data.completed === "true";

        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Metode der opdaterer opgaven
    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
    }

    // Metode der konverterer task til et Excel-venligt objekt
    toExcelRow() {
        return {
            id: this.id,
            titel: this.titel,
            beskrivelse: this.beskrivelse,
            type: this.type,
            zone: this.zone,
            radius: this.radius,
            latitude: this.latitude,
            longitude: this.longitude,
            options: this.options.join(";"),
            activated: this.activated,
            completed: this.completed,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Task;
