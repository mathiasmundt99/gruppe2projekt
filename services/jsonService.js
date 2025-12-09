// jsonService.js
// Denne service håndterer eksport af Task-objekter til det fælles format

function exportToSharedJSON(task) {
    return task.toSharedJSON();
}

module.exports = {
    exportToSharedJSON
};
