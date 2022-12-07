const Achievement = require("../models/Achievement.model");
const User = require("../models/User.model");




async function checkAchievement(user, achievmentName, setter, getter, duration) {

    const onFire = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let alreadyOnFire = false;

    user.achievements.forEach(achievement => {
        if (achievement.toString() === onFire.id) {
            alreadyOnFire = true;
        }
    })

    console.log(alreadyOnFire)

    if (!alreadyOnFire) {
        const lastMonthDate = new Date()
        lastMonthDate[setter](lastMonthDate[getter]() - duration)

        const lastMonthHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks]
            }, [])
            .filter((hook) => hook.date > lastMonthDate)



        if (lastMonthHooks.length >= 5) {
            gain += 50

            await User.findByIdAndUpdate(user.id, { $push: { achievements: onFire.id } })
        }


    }

    return gain;


}




module.exports = { checkAchievement };