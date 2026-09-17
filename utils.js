/**
 * Utility function to determine if a value should be pluralized
 * @param {number} value - The count to check
 * @returns {string} - Returns 's' if value is 0 or greater than 1, empty string otherwise
 */
export const isMultiple = (value) => (value === 0 || value > 1 ? "s" : "")

/**
 * Selects a sponsored property from the list
 * Priority: 
 * 1. Properties with isSponsored flag set to true
 * 2. If none, randomly select one property
 * 
 * @param {Array} properties - Array of property objects
 * @returns {Object|null} - The selected sponsored property or null if no properties
 */
export const selectSponsoredProperty = (properties) => {
  if (!properties || properties.length === 0) {
    return null
  }

  // First, check if any property has isSponsored flag
  let sponsoredProperty = properties.find(p => p.isSponsored === true)
  
  // If no property is marked as sponsored, randomly select one
  if (!sponsoredProperty) {
    const randomIndex = Math.floor(Math.random() * properties.length)
    sponsoredProperty = properties[randomIndex]
  }
  
  return sponsoredProperty
}
