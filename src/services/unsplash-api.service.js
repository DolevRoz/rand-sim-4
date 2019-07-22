import 'dotenv/config'
import createHttpService from './http.service'
import * as Vibrant from 'node-vibrant'

class UnsplashApiService {
    constructor() {
        this.httpService = createHttpService( process.env.UNSPLASH_API_URL, { 'Authorization': 'Client-ID ' + process.env.UNSPLASH_API_CLIENT_ID } )
    }

    static convertResponseTagsIntoArray( tags ) {
        return tags.map( tag => tag.title )
    }

    static mapUnsplashSearchResponseToJson( unsplashSearchResponse ) {
        const items = unsplashSearchResponse.results

        return items.map( item => {
            return {
                id: item.id,
                width: item.width,
                height: item.height,
                color: item.color,
                description: item.description,
                url: item.urls.regular,
                likes: item.likes,
                tags: UnsplashApiService.convertResponseTagsIntoArray( item.tags )
            }
        } )
    }

    static mapUnsplashPhotoInfoResponse( unsplashPhotoInfoResponse ) {
        return {
            id: unsplashPhotoInfoResponse.id,
            width: unsplashPhotoInfoResponse.width,
            height: unsplashPhotoInfoResponse.height,
            description: unsplashPhotoInfoResponse.description,
            urls: unsplashPhotoInfoResponse.urls,
            likes: unsplashPhotoInfoResponse.likes,
            camera: unsplashPhotoInfoResponse.exif,
            tags: UnsplashApiService.convertResponseTagsIntoArray( unsplashPhotoInfoResponse.tags )
        }
    }

    async fetchPhotosFromUnsplashApi( term ) {
        const photos = await this.httpService.get( '/search/photos?query=' + term )

        return UnsplashApiService.mapUnsplashSearchResponseToJson( photos.data )
    }

    async fetchPhotoInfo( photoId ) {
        const photoInfoResponse = await this.httpService.get( '/photos/' + photoId )

        const colorPalette = await Vibrant.from( photoInfoResponse.data.urls.regular ).getPalette()

        const photoInfo = UnsplashApiService.mapUnsplashPhotoInfoResponse( photoInfoResponse.data )

        // Hint: Spread object syntax
        return {
            ...photoInfo,
            palette: {
                ...colorPalette
            }
        }
    }
}

export default UnsplashApiService
