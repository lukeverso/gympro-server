import cloudinary from 'cloudinary';

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