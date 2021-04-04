import client from './client.js'

const today = new Date().toISOString().substring(0, 10)

export function createSnapshot() {

    // Make snapshots
    client.droplets.list()
        .then(
            function (droplets) {
                droplets.forEach(function (droplet) {

                    let slug = droplet.name + '_' + today;

                    console.log("MANAGE: " + droplet.name);

                    client.snapshots.list(
                        {
                            resource_type: 'droplet'
                        }
                    )
                        .then(function (snapshots) {
                            let found = false;

                            console.log("Search if image exists: " + slug);

                            // Check if we have images with same slug
                            snapshots.forEach(function (snapshot) {
                                if (snapshot.name === slug) {
                                    console.log("WARNING! Found a snapshot with same slug " + slug);
                                    found = true;
                                }
                            });
                            // No snapshot with same slug, create it!
                            if (!found) {
                                client.droplets.snapshot(droplet.id, slug)
                                    .then(
                                        function (response) {
                                            console.log("Create new snapshot for " + droplet.name);

                                            let output = {
                                                "id": response.id,
                                                "type": response.type,
                                                "status": response.status,
                                                "started_at": response.started_at
                                            }

                                            console.log(output);
                                            console.log("---------------------------------------------------------");
                                        }
                                    );
                            }
                        });
                });
            }
        );
}