// jsonService.js
// Denne service håndterer eksport af Task-objekter til det fælles format

function exportToSharedJSON(task) {
    try {
        if (!task || typeof task.toSharedJSON !== 'function') {
            throw new Error('Invalid task object: missing toSharedJSON method');
        }
        return task.toSharedJSON();
    } catch (error) {
        console.error('Failed to export task:', error);
    }
}

module.exports = {
    exportToSharedJSON
};
