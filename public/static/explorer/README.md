# explorer.loopback.io

API Explorer for LoopBack 4.

## Explorer

The UI will be available at https://explorer.loopback.io/?url=*your-openapi-or-swagger-spec-url* or http://explorer.loopback.io/?url=*your-openapi-or-swagger-spec-url*.

## Setup

To preview this website locally,
- Install [Node.js](https://nodejs.org/en/) version 8 or higher
- Clone this repo:
```sh
git clone https://github.com/strongloop/explorer.loopback.io.git
```
- Enter the repository directory and run the following commands:
```sh
cd explorer.loopback.io
npm install
npm start
```

## Making Changes

Running `npm run swagger-ui` will update the explorer by first **DELETING** all files/folder in this repository except the ones in the `filesToKeep` array in `update-swagger-ui.js` and then copying the new files in their place.

To change the base templates, please modify `index.loopback.html`.

### Updating the UI

To upgrade `swagger-ui` to a newer version:

1. Update the [`swagger-ui-dist`](https://www.npmjs.com/package/swagger-ui-dist) version in [package.json](https://github.com/strongloop/explorer.loopback.io/blob/master/package.json). You can use `npm update swagger-ui-dist`.

2. Run `npm install` which in turn executes `node ./update-swagger-ui.sh` to copy files.

3. Create a pull request to merge changes to `master` branch.

## Contributing

This project uses [DCO](https://developercertificate.org/). Be sure to sign off
your commits using the `-s` flag or adding `Signed-off-By: Name<Email>` in the
commit message.

**Example**

```
git commit -s -m "feat: my commit message"
```

## License

This repository is provided under the [MIT License](LICENSE).
