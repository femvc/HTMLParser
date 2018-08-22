'use strict'
/*
 * HTML Parser By Andy Wang (femvc.com)
 * Original code by Andy Wang, Mozilla Public License
 * Use like this:
 *     var opt_str = '<div id="test">This is a test.</div>'
 *     hui.bocument.documentElement.setInnerHTML(opt_str)
 *     alert(hui.bocument.getElementById('test').g etInnerHTML())
 *
 */
  window.hui = window.hui || {}
  
  hui.HTMLElement = function (options) {
    this.guid = hui.HTMLElement.makeGUID()
    this.attributes = []
    this.properties = {
      'id': 1
    }
  }
  hui.HTMLElement.prototype = {
    getGUID: function () {
      var me = this
      return me.guid
    },
    appendChild: function (child) {
      var me = this
      if (child && me.childNodes) {
        me.removeChild(child)
        
        me.childNodes.push(child)
        if (child.tagName !== 'nodetext' && child.tagName !== 'comment' && child.tagName !== 'doctype') {
          me.children.push(child)
        }
        
        child.parentNode = me
        child.nextSibling = undefined
        if (me.childNodes.length === 1) {
          me.firstChild = child
        }
        me.lastChild = child
        child.previousSibling = me.childNodes[me.childNodes.length - 2]
        if (child.previousSibling) {
          child.previousSibling.nextSibling = child
        }
      }
    },
    removeChild: function (elem) {
      var me = this
      if (me.childNodes) {
        for (var i = 0, len = me.childNodes.length; i < len; i++) {
          if (me.childNodes[i] === elem) {
            me.childNodes.splice(i, 1)
            break
          }
        }
      }
      if (me.children) {
        for (var i = 0, len = me.children.length; i < len; i++) {
          if (me.children[i] === elem) {
            me.children.splice(i, 1)
            break
          }
        }
      }
      
      if (me.firstChild === elem) {
        me.firstChild = elem.nextSibling
      }
      if (me.lastChild === elem) {
        me.lastChild = elem.previousSibling
      }
      elem.parentNode = undefined
      if (elem.previousSibling) {
        elem.previousSibling.nextSibling = elem.nextSibling
      }
      if (elem.nextSibling) {
        elem.nextSibling.previousSibling = elem.previousSibling
      }
    },
    insertBefore: function (parentNode, nextNode) {
      var me = this
      if (!parentNode) {
        throw new Error('insertBefore(parentNode, nextSibling), parentNode is null.')
      }
      if (me.parentNode) {
        if (me.parentNode.firstChild === me) {
          me.parentNode.firstChild = me.nextSibling
        }
        if (me.parentNode.lastChild === me) {
          me.parentNode.lastChild = me.previousSibling
        }
        me.parentNode.removeChild(me)
      }
      
      if (me.nextSibling) {
        me.nextSibling.previousSibling = me.previousSibling
      }
      if (me.previousSibling) {
        me.previousSibling.nextSibling = me.nextSibling
      }
      if (nextNode) {
        me.nextSibling = undefined
        for (var i = 0, len = parentNode.childNodes.length; i < len; i++) {
          if (parentNode.childNodes[i] === nextNode) {
            parentNode.childNodes.splice(i, 0, me)
            me.previousSibling = nextNode.previousSibling
            me.nextSibling = nextNode
            if (nextNode.previousSibling) {
              nextNode.previousSibling.nextSibling = me
            }
            nextNode.previousSibling = me
            break
          }
        }
        if (!me.nextSibling) {
          parentNode.appendChild(me)
        }
      }
      else {
        parentNode.appendChild(me)
      }

    },
    insertAfter: function (parentNode, previousSibling) {
      this.insertBefore(parentNode, previousSibling ? previousSibling.nextSibling : null)
    },
    getAttribute: function (attrName) {
      var me = this,
        attrValue = undefined,
        list = me.attributes
      for (var i = 0, len = list.length; i < len; i++) {
        if (list[i].name == attrName) {
          attrValue = list[i].value
          break
        }
      }
      return attrValue
    },
    setAttribute: function (attrName, attrValue) {
      var me = this,
        attrValue = attrValue == undefined ? '' : attrValue,
        list = me.attributes,
        exist = false
      for (var i = 0, len = list.length; i < len; i++) {
        if (list[i].name == attrName) {
          list[i].value = attrValue
          exist = true
          break
        }
      }
      if (!exist) {
        me.attributes.push({
          name: attrName,
          value: attrValue
        })
      }
      return attrValue
    },
    removeAttribute: function (attrName) {
      var me = this,
        attrValue = undefined,
        list = me.attributes,
        exist = false
      for (var i = 0, len = list.length; i < len; i++) {
        if (list[i].name == attrName) {
          me.attributes.splice(i, 1)
          break
        }
      }

      return attrValue
    },
    getElementsByTagName: function (tagName) {
      var me = this,
        list = hui.HTMLElement.findAllNodes(me),
        result = []
      tagName = String(tagName).toUpperCase()
      for (var i = 0, len = list.length; i < len; i++) {
        if (tagName == String(list[i].tagName).toUpperCase()) {
          result.push(list[i])
        }
      }
      return result
    },
    setInnerHTML: function (str) {
      var me = this
      me.childNodes = []
      me.children = []
      hui.bocument.parse(str, me)
    },
    getInnerHTML: function () {
      var me = this,
        html = '',
        list = me.childNodes || []
      for (var i = 0, len = list.length; i < len; i++) {
        html += list[i].getOuterHTML()
      }
      return html
    },
    getOuterHTML: function () {
      var me = this,
        str,
        html = '',
        attr = '',
        inner,
        max,
        mm,
        list = me.attributes
      for (var i = 0, len = list.length; i < len; i++) {
        attr += ' ' + list[i].name + '="' + (list[i].value == undefined ? '' : list[i].value) + '"'
      }
      for (var i in me.properties) {
        if (me[i] !== undefined) {
          attr += ' ' + i + '="' + me[i] + '"'
        }
      }

      if (me.nodeType == 'selfClose') {
        if (me.tagName == 'nodetext' && me.clazz == 'Text()') {
          // <style> .a {} .b {} </style>
          if (me.parentNode && me.parentNode.tagName === 'style') {
            str = me.nodeValue.replace(/^[ \t]+/, ' ')
            str = str.replace(/[ \t]+/g, ' ')
            str = str.replace(/[\r\n]+[ \t]+/g, '\n')
            str = str.replace(/[ \t]+[\r\n]+/g, '')
            str = str.replace(/[\r\n]+$/g, '')
            html = str
          } 
          else {
            str = me.nodeValue.replace(/^[ \t]+/, ' ').replace(/[ \t]+$/, ' ').replace(/[\n\r]+$/g, ' ')
            str = str.replace(/\s+/g, ' ').replace(/^\s+$/g, '')
            if (!str) html = ''
            // exp. <h1> this is<b>Tom</b>.</h1>
            else {
              // <li> this is <b>Tom</b> </li>
              if (me.parentNode && me.parentNode.children && me.parentNode.children.length 
                && me.hasBlockElement(me.parentNode.children)) {
                str = str.replace(/^\s+/g, '').replace(/\s+$/g, '')
                html = str
              } else
                html = str
            }
          }
        }
        else if (me.tagName == 'comment' && me.clazz == 'Comment()') {
          html = '<!--' + me.nodeValue + '-->'
        }
        else if ((me.tagName == 'textarea' || me.tagName == 'pre') && me.clazz == 'HTMLElement()') {
          html = '<' + me.tagName + attr + '>' + me.nodeValue + '</' + me.tagName + '>'
        }
        else if (me.tagName == 'script' && me.clazz == 'HTMLElement()') {
          str = me.nodeValue.replace(/\r/g, '\n').replace(/\n+/g, '\n')
          str = str.replace(/\n+[ \t]+(\n|$)/g, '')
          str = str.replace(/\n+$/g, '')
          str = str.replace(/^\n+/g, '')
          html = '<' + me.tagName + attr + '>' + str + '</' + me.tagName + '>'
        }
        else if (me.tagName == 'doctype' && me.clazz == 'DocumentType()') {
          html = me.nodeValue
        }
        else {
          html = '<' + me.tagName + attr + ' />'
        }
      }
      else {
        inner = me.getInnerHTML()
        html = '<' + me.tagName + attr + '>' + inner + '</' + me.tagName + '>'
      }

      return html
    },
    getFormatInnerHTML: function () {
      var me = this,
        html = '',
        list = me.childNodes || []
      for (var i = 0, len = list.length; i < len; i++) {
        html += list[i].getFormatOuterHTML()
      }
      return html
    },
    getFormatOuterHTML: function () {
      var me = this,
        str,
        indent = me.getIndentSize(),
        html = '',
        attr = '',
        inner,
        max,
        mm,
        list = me.attributes
      for (var i = 0, len = list.length; i < len; i++) {
        attr += ' ' + list[i].name + '="' + (list[i].value == undefined ? '' : list[i].value) + '"'
      }
      for (var i in me.properties) {
        if (me[i] !== undefined) {
          attr += ' ' + i + '="' + me[i] + '"'
        }
      }

      if (me.nodeType == 'selfClose') {
        if (me.tagName == 'nodetext' && me.clazz == 'Text()') {
          // <style> .a {} .b {} </style>
          if (me.parentNode && me.parentNode.tagName === 'style') {
            str = me.nodeValue.replace(/^[ \t]+/, ' ')
            str = str.replace(/[ \t]+/g, ' ')
            str = str.replace(/[\r\n]+[ \t]+/g, '\n')
            str = str.replace(/[ \t]+[\r\n]+/g, '')
            str = str.replace(/[\r\n]+$/g, '')
            str = str.replace(/[\r\n]+/g, indent + '  ')
            html = str
          } 
          else {
            str = me.nodeValue.replace(/^[ \t]+/, ' ').replace(/[ \t]+$/, ' ').replace(/[\n\r]+$/g, ' ')
            str = str.replace(/\s+/g, ' ').replace(/^\s+$/g, '')
            if (!str) html = ''
            // exp. <h1> this is<b>Tom</b>.</h1>
            else {
              // <li> this is <b>Tom</b> </li>
              if (me.parentNode && me.parentNode.children && me.parentNode.children.length 
                && me.hasBlockElement(me.parentNode.children)) {
                str = str.replace(/^\s+/g, '').replace(/\s+$/g, '')
                html = indent + str
              } else
                html = str
            }
          }
        }
        else if (me.tagName == 'comment' && me.clazz == 'Comment()') {
          html = indent + '<!--' + me.nodeValue.replace(/\n/g, indent + '  ') + '-->'
        }
        else if ((me.tagName == 'textarea' || me.tagName == 'pre') && me.clazz == 'HTMLElement()') {
          html = indent + '<' + me.tagName + attr + '>' + me.nodeValue + '</' + me.tagName + '>'
        }
        else if (me.tagName == 'script' && me.clazz == 'HTMLElement()') {
          str = me.nodeValue.replace(/\r/g, '\n').replace(/\n+/g, '\n')
          str = str.replace(/\n+[ \t]+(\n|$)/g, '')
          str = str.replace(/\n+$/g, '')
          str = str.replace(/^\n+/g, '')
          if (str) {
            list = str.split('\n')
            max = Array(1024).join(' ')
            list.forEach(function(item){
              mm = item.match(/^[ ]*/)[0]
              if (mm.length < max.length) max = mm
            })
            for (var i = 0; i < list.length; i++) {
              list[i] = indent + '  ' + list[i].replace(max, '')
            }
            str = list.join('')
          }
          html = indent + '<' + me.tagName + attr + '>' + str + (str ? indent : '') + '</' + me.tagName + '>'
        }
        else if (me.tagName == 'doctype' && me.clazz == 'DocumentType()') {
          html = indent + me.nodeValue
        }
        else {
          html = indent + '<' + me.tagName + attr + ' />'
        }
      }
      else {
        inner = me.getFormatInnerHTML()
        html = ((hui.bocument.block[me.tagName] || (me.parentNode && me.parentNode.children 
          && me.parentNode.children.length && me.hasBlockElement(me.parentNode.children))) ? indent : '') + '<' + me.tagName + attr + '>' + inner + 
          ((me.children && me.children.length && me.hasBlockElement(me.children)) || me.tagName === 'style' ? indent : '') + '</' + me.tagName + '>'
      }

      return html
    },
    getIndentSize: function () {
      var parentNode = this
      var indentSize = -1
      while (parentNode) {
        if (parentNode.tagName && parentNode.tagName !== 'head' && parentNode.tagName !== 'body')
          indentSize++
        parentNode = parentNode.parentNode
      }
      return '\n' + Array(indentSize).join('  ')
    },
    hasBlockElement (list) {
      for (var i in list) {
        if (list[i] && list[i].tagName && hui.bocument.block[list[i].tagName]) 
          return true
      }
      return false
    }
  }
  /**
   * @name 获取唯一id
   * @public
   * @return {String}
   */
  hui.HTMLElement.makeGUID = (function () {
    var guid = 1000000; // 0 -> root
    return function () {
      return String(guid++)
    }
  })()

  /**
   * @name 获取所有子节点element
   * @public
   * @param {HTMLElement} elem
   * @param {String} stopAttr 如果元素存在该属性,如'ui',则不遍历其下面的子元素
   */
  hui.HTMLElement.findAllNodes = function (elem, stopAttr) {
    var i, len, k, v,
      childNode,
      elements,
      list,
      childlist,
      node
    elements = []
    list = [elem]

    while (list.length) {
      childNode = list.pop()
      if (!childNode) continue
      // Not set 'stopAttr', get all nodeds.
      if (stopAttr === undefined || (childNode.getAttribute && childNode.getAttribute(stopAttr))) {
        elements.push(childNode)
      }
      childlist = childNode.childNodes
      if (!childlist || childlist.length < 1) continue
      if (childNode != elem && stopAttr !== undefined && childNode.getAttribute(stopAttr)) {
        continue
      }
      for (i = 0, len = childlist.length; i < len; i++) {
        node = childlist[i]
        list.push(node)
      }
    }
    // 去掉顶层elem,如不去掉处理复合控件时会导致死循环!!
    if (elements[0] === elem) elements.shift()

    return elements.reverse()
  }

  /**
   * @name 根据GUID获取元素
   * @public
   * @param {String} guid 元素全局唯一标识符
   * @return {element}
   */
  hui.HTMLElement.getElementByGUID = function (guid, parentNode) {
    var me = this,
      result = null,
      parentNode = parentNode || hui.bocument.documentElement,
      list = hui.HTMLElement.findAllNodes(parentNode)

    if (guid === undefined || guid === parentNode.getGUID()) {
      result = parentNode
    }
    else if (parentNode) {
      for (var i = 0, len = list.length; i < len; i++) {
        if (guid == list[i].getGUID()) {
          result = list[i]
          break
        }
      }
    }

    return result
  }

  hui.bocument = {
    // Regular Expressions for parsing tags and attributes
    startTag: /^<([-A-Za-z0-9_]+)((?:\s+[\w\-]+(?:\s*=\s*(?:(?:"[^"]*\")|(?:'[^']*\')|[^>\s]+))?)*)((?:\s*[\w\-]+(?:\s*=\s*(?:(?:"[^"]*\")|(?:'[^']*\')|[^>\s]+))?)*)\s*(\/?)>/, //"
    endTag: /^<\/([-A-Za-z0-9_]+)[^>]*>/,
    attr: /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)\")|(?:'((?:\\.|[^'])*)\')|([^>\s]+)))?/g, //"

    // System Elements
    sysTag: {
      'html': 1,
      'head': 1,
      'body': 1,
      'title': 1
    },

    // Empty Elements - HTML 4.01
    empty: {
      'area': 1,
      'base': 1,
      'basefont': 1,
      'br': 1,
      'col': 1,
      'frame': 1,
      'hr': 1,
      'img': 1,
      'input': 1,
      'isindex': 1,
      'link': 1,
      'meta': 1,
      'param': 1,
      'embed': 1
    },

    // Block Elements - HTML 4.01
    block: {
      'address': 1,
      'applet': 1,
      'blockquote': 1,
      'body': 1,
      'center': 1,
      'dd': 1,
      'del': 1,
      'dir': 1,
      'div': 1,
      'dl': 1,
      'dt': 1,
      'fieldset': 1,
      'form': 1,
      'frameset': 1,
      'hr': 1,
      'html': 1,
      'iframe': 1,
      'ins': 1,
      'isindex': 1,
      'li': 1,
      'map': 1,
      'menu': 1,
      'meta': 1,
      'noframes': 1,
      'noscript': 1,
      'object': 1,
      'ol': 1,
      'p': 1,
      'pre': 1,
      'script': 1,
      'table': 1,
      'tbody': 1,
      'td': 1,
      'tfoot': 1,
      'th': 1,
      'thead': 1,
      'title': 1,
      'tr': 1,
      'ul': 1,
      'h1': 1,
      'h2': 1,
      'h3': 1,
      'h4': 1,
      'h5': 1,
      'h6': 1
    },

    // Inline Elements - HTML 4.01
    inline: {
      'a': 1,
      'abbr': 1,
      'acronym': 1,
      'applet': 1,
      'b': 1,
      'basefont': 1,
      'bdo': 1,
      'big': 1,
      'br': 1,
      'button': 1,
      'cite': 1,
      'code': 1,
      'del': 1,
      'dfn': 1,
      'em': 1,
      'font': 1,
      'i': 1,
      'iframe': 1,
      'img': 1,
      'input': 1,
      'ins': 1,
      'kbd': 1,
      'label': 1,
      'map': 1,
      'object': 1,
      'q': 1,
      's': 1,
      'samp': 1,
      'script': 1,
      'select': 1,
      'small': 1,
      'span': 1,
      'strike': 1,
      'strong': 1,
      'sub': 1,
      'sup': 1,
      'textarea': 1,
      'tt': 1,
      'u': 1,
      'var': 1
    },

    // Elements that you can leave open. <p><p>123 => <p></p><p>456</p>
    // Not selfClose !!!
    closeSelf: {
      'colgroup': 1,
      'dd': 1,
      'dt': 1,
      'li': 1,
      'p': 1,
      'tfoot': 1,
      'thead': 1,
      'tr': 1,
      'th': 1,
      'td': 1
    },

    // Attributes that have their values filled in disabled="disabled"
    fillAttrs: {
      'checked': 1,
      'compact': 1,
      'declare': 1,
      'defer': 1,
      'disabled': 1,
      'ismap': 1,
      'multiple': 1,
      'nohref': 1,
      'noresize': 1,
      'noshade': 1,
      'nowrap': 1,
      'readonly': 1,
      'selected': 1
    },

    // Special Elements (can contain anything)
    special: {
      'script': 1,
      'style': 1
    },
    // Token serial
    stack: [],
    // Strict xml model!!
    parse: function (html, root) {
      var me = this
      me.stack = me.tokenization(html)
      me.domtree = me.treeConstruction(me.stack, root)
      return me.domtree
    },
    // Token serial
    tokenization: function (html) {
      var me = this,
        tokenserial = [],
        index,
        m, n,
        token,
        nodeValue,
        match,
        last = html = String(html)

      // status machines
      var chars = true,
        attrs = false,
        tagOpen = false,
        commentOpen = false,
        docOpen = true,
        script = false,
        style = false

      // <!--comment--> <html>1234</html>
      while (html) {
        // doctype 
        if (String(html).toUpperCase().indexOf('<!DOCTYPE') === 0) {
          m = html.indexOf('>', 5)
          n = html.indexOf('<', 5)

          index = m == -1 ? (n > -1 ? /*m=-1&&n>-1*/ n : /*m=-1&&n=-1*/ html.length) :
          /*m  > -1 ?*/
          (n == -1 ? /*m>-1&&n=-1*/ m + 1 : /*m>-1&&n>-1*/ (m > n ? n : m + 1))
          nodeValue = html.substring(0, index)
          token = {
            tagName: 'doctype',
            clazz: 'DocumentType()',
            nodeValue: nodeValue,
            nodeType: 'selfClose'
          }
          tokenserial.push(token)
          html = html.substring(index, html.length)
        }
        // Comment 
        else if (html.indexOf('<!--') === 0) {
          n = html.indexOf('-->', 4)
          n = n == -1 ? html.length : n
          nodeValue = html.substring(4, n)
          token = {
            tagName: 'comment',
            clazz: 'Comment()',
            nodeValue: nodeValue,
            nodeType: 'selfClose'
          }
          tokenserial.push(token)
          html = html.substring(n + 3, html.length)
        }
        // end tag
        if (html.indexOf('</') === 0) {
          match = html.match(me.endTag)

          if (match) {
            token = {
              tagName: String(match[1]).toLowerCase(),
              clazz: 'HTMLElement()',
              nodeType: 'endTag'
            }
            tokenserial.push(token)
            html = html.substring(match[0].length)
          }
        }
        // start tag
        else if (html.indexOf('<') === 0 && html.match(me.startTag)) {
          match = html.match(me.startTag)

          if (match) {
            var attrs = []

            match[2].replace(me.attr, function (match, name) {
              var value = arguments[2] ? arguments[2] :
                arguments[3] ? arguments[3] :
                arguments[4] ? arguments[4] :
                me.fillAttrs[name] ? name : ""

              attrs.push({
                name: String(name).toLowerCase(),
                value: value,
                escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
              })
            })

            token = {
              tagName: String(match[1]).toLowerCase(),
              clazz: 'HTMLElement()',
              attributes: attrs,
              nodeType: me.empty[String(match[1]).toLowerCase()] ? 'selfClose' : 'startTag'
            }
            html = html.substring(match[0].length)

            // <textarea> 456</body> </textarea>
            if (token.tagName === 'textarea' && token.nodeType === 'startTag') {
              token.nodeType = 'selfClose'
              n = String(html).toLowerCase().indexOf('</textarea')
              n = n == -1 ? html.length : n
              nodeValue = html.substring(0, n)
              token.nodeValue = nodeValue
              
              html = html.substring(n)
              m = html.indexOf('>')
              m = m == -1 ? html.length : m

              html = html.substring(m + 1)
            } 
            // <pre> 456</body> </pre>
            else if (token.tagName === 'pre' && token.nodeType === 'startTag') {
              token.nodeType = 'selfClose'
              n = String(html).toLowerCase().indexOf('</pre')
              n = n == -1 ? html.length : n
              nodeValue = html.substring(0, n)
              token.nodeValue = nodeValue
              
              html = html.substring(n)
              m = html.indexOf('>')
              m = m == -1 ? html.length : m

              html = html.substring(m + 1)
            }
            // <script> 456</body> </script>
            else if (token.tagName === 'script' && token.nodeType === 'startTag') {
              token.nodeType = 'selfClose'
              n = String(html).toLowerCase().indexOf('</script')
              n = n == -1 ? html.length : n
              nodeValue = html.substring(0, n)
              token.nodeValue = nodeValue
              
              html = html.substring(n)
              m = html.indexOf('>')
              m = m == -1 ? html.length : m

              html = html.substring(m + 1)
            }
            
            tokenserial.push(token)
          }
        }
        // text
        else {
          m = html.indexOf('<', 1)
          index = m == -1 ? html.length : m
          nodeValue = html.substring(0, index)

          token = {
            tagName: 'nodetext',
            clazz: 'Text()',
            nodeValue: nodeValue,
            nodeType: 'selfClose'
          }
          tokenserial.push(token)
          html = html.substring(index, html.length)
        }
      }

      return tokenserial
    },
    treeConstruction: function (tokens, parentNode) {
      var me = this,
        domtree = parentNode || hui.bocument.documentElement,
        currentParent = domtree,
        token,
        elem,
        parentElem
      for (var i = 0, len = tokens.length; i < len; i++) {
        token = tokens[i]

        if (token.nodeType == 'selfClose') {
          elem = me.createElement(token.tagName, token)
          currentParent.appendChild(elem)
        }
        else if (me.empty[token.tagName] || token.nodeType == 'startTag') {
          token.nodeType = 'startTag'
          elem = me.createElement(token.tagName, token)
          if (currentParent.tagName === token.tagName && me.closeSelf[currentParent.tagName]) {
            currentParent = currentParent.parentNode
          }
          currentParent.appendChild(elem)

          // Not empty tag
          if (!me.empty[token.tagName]) {
            elem.childNodes = []
            elem.children = []
            currentParent = elem
          }
        }
        else if (token.nodeType == 'endTag') {
          if (token.tagName == currentParent.tagName) {
            currentParent = currentParent.parentNode
          }
          // Only deal with block tag!
          else if (me.block[token.tagName]) {
            parentElem = currentParent
            while (parentElem) {
              if (parentElem.tagName == token.tagName) {
                currentParent = parentElem.parentNode
                break
              }
              else {
                parentElem = parentElem.parentNode
              }
            }
          }
        }
      }
      return domtree

    },
    createElement: function (tagName, options) {
      var me = this,
        clazz = me.getElementConstructor(),
        elem = new clazz()
      if (!tagName) {
        throw new Error('createElement(tagName, options), tagName is null.')
      }
      tagName = String(tagName).toLowerCase()
      options = options || {}
      options.tagName = tagName

      for (var i in options) {
        elem[i] = options[i]
      }
      if (!elem.nodeType) {
        elem.nodeType = me.empty[tagName] ? 'selfClose' : 'startTag'
      }
      // 特殊属性
      if (elem.getAttribute('id')) {
        elem.id = elem.getAttribute('id')
        elem.removeAttribute('id')
        elem.properties['id'] = 1
      }
      return elem
    },
    createTextNode: function (nodeValue) {
      return this.createElement('nodetext', {
        tagName: 'nodetext',
        clazz: 'Text()',
        nodeValue: nodeValue,
        nodeType: 'selfClose'
      })
    },
    getElementConstructor: function () {
      return function () {
        this.getGUID = function () {
          return this.guid
        }
      }
    },
    getElementById: function (id) {
      var me = this,
        list = hui.HTMLElement.findAllNodes(hui.bocument.documentElement),
        result = undefined

      for (var i = 0, len = list.length; i < len; i++) {
        if (id === list[i].id) {
          result = list[i]
          break
        }
      }
      return result
    }
  }
  // Over write method 'getElementConstructor'
  hui.bocument.getElementConstructor = function () {
    return hui.HTMLElement
  }

  // 根节点 
  hui.bocument.documentElement = hui.bocument.createElement('HTML', {
    childNodes: [],
    children: [],
    clazz: 'HTMLElement()',
    nodeType: 'startTag'
  })
  // body节点 
  hui.bocument.body = hui.bocument.createElement('BODY', {
    childNodes: [],
    children: [],
    clazz: 'HTMLElement()',
    nodeType: 'startTag'
  })

  hui.window = {}
  window.bocument = hui.bocument
