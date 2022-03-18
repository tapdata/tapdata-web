export class FromNodeEvent {
  type = 'from:node'
  data
  context
  constructor(data) {
    this.data = data
  }
}
