const fs = require('fs')
const db = require('../model/connection')



module.exports = {

    banner: () => {
        return new Promise((resolve, reject) => {
            try {

                db.banner.find({}).then((data) => {
                    resolve(data)
                })

            } catch (error) {

            }
        })

    },

    getBanner: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.banner.find({ _id: id }).then((data) => {
                    resolve(data)
                })
            } catch (error) {
                console.log(error);
            }
        })
    },

    addBanner: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let banner = await db.banner(data).save()
                resolve(banner._id)
            } catch (error) {

            }
        })
    },

    editBanner: (id, data) => {
        return new Promise((resolve, reject) => {
            console.log('data', data);
            try {
                db.banner.updateOne({ _id: id }, {
                    $set: {
                        title: data?.title,
                        description: data?.description,
                        marketPrice: data?.marketPrice,
                        offerPrice: data?.offerPrice
                    }
                }).then((banner) => {
                    resolve(banner)
                })
            } catch (error) {

            }
        })
    },

    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.banner.deleteOne({ _id: id }).then(() => {
                    let fileNameWithPath = `./public/banner-images/${id}.jpg`
                    if (fs.existsSync(fileNameWithPath)) {
                        fs.unlink(fileNameWithPath, (err) => {
                            console.log(err);
                        });
                    }
                    resolve({ status: true })
                })
            } catch (error) {

            }
        })
    },
    
    categoryFind: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.categoryBanner.find({id}).then((data) => {
                    resolve(data)
                })
                
            } catch (error) {
                console.log(error);
            }
        })
    },
    
    addCategoryBanner:  (data) => {
        console.log(data);
        return new Promise(async(resolve, reject) => {
            try {
                let banner = {
                    title: data.title,
                    category: data.category,
                    description: data.description,
                }
                await db.categoryBanner(banner).save().then((catBan)=>{
                    resolve(catBan._id)
                })
            } catch (error) {

            }
        })
    },

    editCategoryBanner: (id, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.categoryBanner.updateOne({ _id: id }, {
                    title0: data.title,
                    category0: data.category,
                    description0: data.description,
                }).then(() => {
                    resolve()
                })
            } catch (error) {

            }
        })
    },

    deleteCategoryBanner:(id,)=>{
        return new Promise((resolve, reject) => {
            console.log('helpers');
            try {
                db.categoryBanner.deleteOne({ _id: id }).then((status) => {
                    console.log(status);
                    let fileNameWithPath = `./public/banner-images/${id}.jpg`
                    if (fs.existsSync(fileNameWithPath)) {
                        fs.unlink(fileNameWithPath, (err) => {
                            console.log(err);
                        });
                    }
                    resolve({ status: true })
                })
            } catch (error) {

            }
        })
    }


}