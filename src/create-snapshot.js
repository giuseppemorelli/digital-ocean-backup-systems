import client from './client.js'

const today = new Date().toISOString().substring(0, 10)

export function createSnapshot() {

    // Make snapshots
    client.droplets.list()
        .then(
            function (droplets) {
                droplets.forEach(function (droplet) {

                    let slug = droplet.name + '_' + today;

                    console.log("MANAGE: "+droplet.name);

                    client.images.list(
                        {
                            private: true
                        }
                    )
                        .then(function (images) {
                            let found = false;

                            console.log("Search if image exists: "+slug);

                            // Check if we have images with same slug
                            images.forEach(function (image) {
                                if (image.name === slug) {
                                    console.log("WARNING! Found an image with same slug " + slug);
                                    found = true;
                                }
                            });
                            // No snapshot with same slug, create it!
                            if (!found) {
                                client.droplets.snapshot(droplet.id, slug)
                                    .then(
                                        function (response) {
                                            console.log("Create new snapshot for "+droplet.name);

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