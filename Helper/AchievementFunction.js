const Achievement = require("../models/Achievement.model");
const User = require("../models/User.model");




async function checkAchievement(user, achievmentName, setter, getter, duration) {

    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach(achievement => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    })



    if (!already) {
        const lastDate = new Date()
        lastDate[setter](lastDate[getter]() - duration)

        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks]
            }, [])
            .filter((hook) => hook.date > lastDate)



        if (lastHooks.length >= 5) {
            gain += 50

            await User.findByIdAndUpdate(user.id, { $push: { achievements: nameOfAchievement.id } })
        }



    }

    return gain;


}


async function checkDesert(user, achievmentName, setter, getter) {
    console.log('hello')

    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach(achievement => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    })

    console.log(already)

    if (!already) {
        const lastDate = new Date()
        lastDate[setter](lastDate[getter]() - 1)


        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks]
            }, [])
            .filter((hook) => hook.date > lastDate)


        console.log("=======", lastHooks)
        if (!lastHooks.length && user.createdAt <= lastDate) {


            await User.findByIdAndUpdate(user.id, { $push: { achievements: nameOfAchievement.id } })
        }



    }

    return gain;


}




module.exports = { checkAchievement, checkDesert };