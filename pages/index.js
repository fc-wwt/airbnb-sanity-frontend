import { sanityClient, urlFor } from "../sanity"
import Link from "next/link"
import { isMultiple, selectSponsoredProperty } from "../utils"
import DashboardMap from "../components/DashboardMap"

const Home = ({ properties, sponsoredProperty }) => {
  console.log(properties)
  console.log("Sponsored:", sponsoredProperty)
  
  return (
    <>
      {properties && (
        <div className="main">
          <div className="feed-container">
            <h1>Places to stay near you</h1>
            <div className="feed">
              {/* Render sponsored property first if it exists */}
              {sponsoredProperty && (
                <Link href={`property/${sponsoredProperty.slug.current}`}>
                  <div key={sponsoredProperty._id} className="card sponsored-card">
                    <div className="sponsored-badge">
                      <span className="star-icon">⭐</span>
                      <span>Sponsored</span>
                    </div>
                    <img src={urlFor(sponsoredProperty.mainImage)} />
                    <p>
                      {sponsoredProperty.reviews.length} review
                      {isMultiple(sponsoredProperty.reviews.length)}
                    </p>
                    <h3>{sponsoredProperty.title}</h3>
                    <h3>
                      <b>£{sponsoredProperty.pricePerNight}/per Night</b>
                    </h3>
                  </div>
                </Link>
              )}
              
              {/* Render remaining properties */}
              {properties
                .filter(property => property._id !== sponsoredProperty?._id)
                .map((property) => (
                  <Link href={`property/${property.slug.current}`} key={property._id}>
                    <div className="card">
                      <img src={urlFor(property.mainImage)} />
                      <p>
                        {property.reviews.length} review
                        {isMultiple(property.reviews.length)}
                      </p>
                      <h3>{property.title}</h3>
                      <h3>
                        <b>£{property.pricePerNight}/per Night</b>
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
          <div className="map">
            <DashboardMap 
              properties={properties} 
              sponsoredProperty={sponsoredProperty}
            />
          </div>
        </div>
      )}
    </>
  )
}

export const getServerSideProps = async () => {
  const query = '*[ _type == "property"]'
  const properties = await sanityClient.fetch(query)

  if (!properties.length) {
    return {
      props: {
        properties: [],
        sponsoredProperty: null,
      },
    }
  } else {
    // Select sponsored property using utility function
    const sponsoredProperty = selectSponsoredProperty(properties)
    
    return {
      props: {
        properties,
        sponsoredProperty,
      },
    }
  }
}

export default Home
