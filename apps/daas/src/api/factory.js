export default name => {
  const Model = require(`../../../../packages/api/src/${name}`).default
  return new Model()
}
