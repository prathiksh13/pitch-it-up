async function testFetch() {
    try {
        console.log("Attempting to fetch Google...");
        const res = await fetch('https://www.google.com');
        console.log("Google Status:", res.status);
    } catch (err) {
        console.error("Fetch Google failed:", err);
    }

    try {
        console.log("Attempting to fetch Firestore...");
        const res = await fetch('https://firestore.googleapis.com/v1/projects/csm-event/databases/(default)/documents');
        console.log("Firestore Status:", res.status);
    } catch (err) {
        console.error("Fetch Firestore failed:", err);
    }
}

testFetch();
