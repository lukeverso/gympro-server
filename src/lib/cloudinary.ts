import cloudinary from 'cloudinary';

cloudinary.v2.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
});

export function uploadPicture(content: Buffer): Promise<object> {
     return new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload_stream(
               { folder: 'profiles' },
               (error: any, result: any) => {
                    if (error) {
                         console.log(error);
                         reject('An error occurred while uploading the file.');
                    } else {
                         resolve(result);
                    }
               }
          ).end(content);
     });
};