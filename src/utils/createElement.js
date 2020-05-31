/**
 * @brief
 * Create a HTML element, directly with children and attributes.
 *
 * @param {String} tag: The tag name of the element.
 * @param {Object} attribute: An object containing the element's attribute(s).
 * @param {Array} children: The list of the element's children.
 *
 */
export default (tag, attribute = {}, children = []) => {
	if (typeof tag === undefined) return
	if (typeof attribute !== 'object') return
	if (typeof children === undefined) children = []

	let element = document.createElement(tag)
	for (let key in attribute) {
		element[key] = attribute[key]
	}

	if (!Array.isArray(children)) children = [children]

	for (let i = 0; i < children.length; ++i) {
		if (children[i].tagName) element.appendChild(children[i])
		else element.appendChild(document.createElement(children[i]))
	}

	return element
}
