import client from './client.js'

const copyRegion = process.env.DO_REGION_COPY;

export function copySnapshot() {

    // Copy snapshots
    client.images.list({
        private: true
    })
        .then(
            function (images) {
                images.forEach(function (image) {
                    client.images.action(
                        image.id,
                        {
                            "type": "transfer",
                            "region": copyRegion
                        }
                    ).then(
                        function (response) {
                            console.log("Copy snapshot "+image.name+" to region "+copyRegion);

                            let output = {
                                "id": response.id,
                                "type": response.type,
                                "status": response.status,
                                "started_at": response.started_at
                            }

                            console.log(output);
                            console.log("---------------------------------------------------------");
                        }
                    ).catch(
                        function (error) {
                            console.log("ERROR!")
                            console.log(error.body.message);
                            console.log(image.name);
                            console.log("---------------------------------------------------------");
                        }
                    );
                });
            });
}

