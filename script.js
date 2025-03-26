document.getElementById("fileUpload").addEventListener("change", handleFile);

let dataset = [];

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        dataset = parseCSV(text);
        console.log("Data Loaded:", dataset);
    };

    reader.readAsText(file);
}

function parseCSV(csvText) {
    const rows = csvText.split("\n").map(row => row.split(","));
    const headers = rows.shift(); // Remove headers
    const salaryHikeIndex = headers.indexOf("PercentSalaryHike");
    const jobSatisfactionIndex = headers.indexOf("JobSatisfaction");

    return rows.map(row => ({
        salaryHike: parseFloat(row[salaryHikeIndex]),
        jobSatisfaction: parseFloat(row[jobSatisfactionIndex])
    })).filter(row => !isNaN(row.salaryHike) && !isNaN(row.jobSatisfaction));
}

function performClustering() {
    if (dataset.length === 0) {
        alert("Please upload a valid CSV file.");
        return;
    }

    const k = parseInt(document.getElementById("numClusters").value);
    const clusters = kMeansClustering(dataset, k);
    plotClusters(clusters);
}

function kMeansClustering(data, k) {
    const centroids = data.slice(0, k); // Initial centroids
    let clusters = new Array(k).fill().map(() => []);

    for (let i = 0; i < 10; i++) { // Max 10 iterations
        clusters = new Array(k).fill().map(() => []);

        data.forEach(point => {
            let minDist = Infinity, clusterIndex = 0;

            centroids.forEach((centroid, i) => {
                const dist = Math.hypot(point.salaryHike - centroid.salaryHike, point.jobSatisfaction - centroid.jobSatisfaction);
                if (dist < minDist) {
                    minDist = dist;
                    clusterIndex = i;
                }
            });

            clusters[clusterIndex].push(point);
        });

        centroids.forEach((_, i) => {
            if (clusters[i].length > 0) {
                centroids[i] = {
                    salaryHike: clusters[i].reduce((sum, p) => sum + p.salaryHike, 0) / clusters[i].length,
                    jobSatisfaction: clusters[i].reduce((sum, p) => sum + p.jobSatisfaction, 0) / clusters[i].length
                };
            }
        });
    }

    return clusters;
}

function plotClusters(clusters) {
    const ctx = document.getElementById("clusterChart").getContext("2d");
    const colors = ["red", "blue", "green", "purple", "orange", "cyan", "magenta", "yellow"];

    const datasets = clusters.map((cluster, i) => ({
        label: `Cluster ${i + 1}`,
        data: cluster.map(point => ({ x: point.salaryHike, y: point.jobSatisfaction })),
        backgroundColor: colors[i % colors.length]
    }));

    new Chart(ctx, {
        type: "scatter",
        data: { datasets },
        options: {
            scales: {
                x: { title: { display: true, text: "Salary Hike (%)" } },
                y: { title: { display: true, text: "Job Satisfaction" } }
            }
        }
    });
}
