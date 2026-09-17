import React from "react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"

const DashboardMap = ({ properties, sponsoredProperty }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.googlePlacesAPI,
  })

  console.log(properties[0].location?.lat)
  console.log(properties[0].location?.lat)
  const containerStyle = {
    width: "100%",
    height: "100vh",
  }

  const center = {
    lat: properties[0].location?.lat,
    lng: properties[0].location?.lng,
  }

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds()
    map.fitBounds(bounds)
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  const regularMarkerIcon =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
  
  // Custom icon for sponsored property - using a star marker
  const sponsoredMarkerIcon = {
    path: "M 12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9 Z",
    fillColor: "#FFD700",
    fillOpacity: 1,
    strokeColor: "#FFA500",
    strokeWeight: 2,
    scale: 1.5,
    anchor: new google.maps.Point(12, 12),
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {properties.map((property, index) => {
        const isSponsored = sponsoredProperty && property._id === sponsoredProperty._id
        
        return (
          <Marker
            key={property._id}
            position={{
              lat: property?.location?.lat,
              lng: property?.location?.lng,
            }}
            icon={
              isSponsored
                ? sponsoredMarkerIcon
                : {
                    url: regularMarkerIcon,
                    anchor: new google.maps.Point(5, 58),
                  }
            }
            label={
              isSponsored
                ? {
                    text: "★",
                    color: "#FFD700",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }
                : undefined
            }
            zIndex={isSponsored ? 1000 : 1}
            title={isSponsored ? `${property.title} (Sponsored)` : property.title}
          />
        )
      })}
      <></>
    </GoogleMap>
  ) : (
    <></>
  )
}

export default React.memo(DashboardMap)
