import client from './client.js'

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
                            "region": "ams2"
                        }
                    ).then(
                        function (response) {
                            console.log(response);
                        }
                    ).catch(
                        function (error) {
                            console.log(image.name);
                            console.log(error.body.message);
                        }
                    );
                });
            });
}

