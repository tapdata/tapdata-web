export default name => {
  const Model = require(`./${name}`).default;
  return new Model();
};
