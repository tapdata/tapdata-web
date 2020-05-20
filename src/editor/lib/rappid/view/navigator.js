/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/29/20
 * @description
 */
export default joint => {
  const util = joint.util;

  joint.shapes.app.NavigatorElementView = joint.dia.ElementView.extend({
    body: null,

    markup: [
      {
        tagName: "rect",
        selector: "body",
        attributes: {
          fill: "#008cee"
        }
      }
    ],

    presentationAttributes: {
      position: ["TRANSLATE"],
      size: ["RESIZE"],
      angle: ["ROTATE"]
    },

    render: function() {
      let doc = util.parseDOMJSON(this.markup);
      this.body = doc.selectors.body;
      this.el.appendChild(doc.fragment);
      this.updateNodesAttributes();
      this.updateTransformation();
    },

    updateNodesAttributes: function() {
      let size = this.model.get("size");
      this.body.setAttribute("width", size.width);
      this.body.setAttribute("height", size.height);
    }
  });

  joint.shapes.app.NavigatorLinkView = joint.dia.LinkView.extend({
    initialize: util.noop,

    render: util.noop,

    update: util.noop
  });
};
