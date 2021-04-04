import client from './client.js'

const today = new Date().toISOString().substring(0, 10)

export function createSnapshot() {

    // Make snapshots
    client.droplets.list()
        .then(
            function (droplets) {
                droplets.forEach(function (droplet) {

                    // @TODO: check if snapshot with the same exist.
                    // In case of loop you will have a lot of snapshot!

                    client.droplets.snapshot(droplet.id, droplet.name + '_' + today)
                        .then(
                            function (result) {
                                console.log(result);
                            }
                        );
                });
            }
        );
}