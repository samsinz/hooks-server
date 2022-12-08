const Achievement = require("../models/Achievement.model");
const User = require("../models/User.model");



async function firstHook(
    user,
    achievmentName,
) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });



    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });

    if (!already) {


        const lastHooks = user.partners




        await User.findByIdAndUpdate(user.id, {
            $push: { achievements: nameOfAchievement.id },
        });

    }


}








async function checkAchievement(
    user,
    achievmentName,
    setter,
    getter,
    duration
) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });

    if (!already) {
        const lastDate = new Date();
        lastDate[setter](lastDate[getter]() - duration);

        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks];
            }, [])
            .filter((hook) => hook.date > lastDate);

        if (lastHooks.length >= 5) {
            gain += 50;

            await User.findByIdAndUpdate(user.id, {
                $push: { achievements: nameOfAchievement.id },
            });
        }
    }

    return gain;
}

async function checkDesert(user, achievmentName, setter, getter) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });

    if (!already) {
        const lastDate = new Date();
        lastDate[setter](lastDate[getter]() - 1);

        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks];
            }, [])
            .filter((hook) => hook.date > lastDate);

        if (!lastHooks.length && user.createdAt <= lastDate) {
            await User.findByIdAndUpdate(user.id, {
                $push: { achievements: nameOfAchievement.id },
            });
        }
    }

    return gain;
}

async function checkShark(user, achievmentName) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });
    console.log("=============", user.partners.length);

    if (!already) {
        if (user.partners.length + 1 === 50) {
            gain += 50;
            await User.findByIdAndUpdate(user.id, {
                $push: { achievements: nameOfAchievement.id },
            });
        }
    }

    return gain;
}

async function checkNumber(user, achievmentName, act, number) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });

    if (!already) {
        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks];
            }, [])
            .filter((hook) => hook.type === act);

        if (lastHooks.length === number) {
            gain += 50;

            await User.findByIdAndUpdate(user.id, {
                $push: { achievements: nameOfAchievement.id },
            });
        }
    }

    return gain;
}

async function checkGrade(user, achievmentName) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });

    console.log(nameOfAchievement, "==================");

    if (!already) {
        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks];
            }, [])
            .filter((hook) => hook.rating < 5);

        if (lastHooks.length >= 5) {
            await User.findByIdAndUpdate(user.id, {
                $push: { achievements: nameOfAchievement.id },
            });
        }
    }

    return gain;
}

async function checkOrgasm(user, achievmentName, number) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    let gain = 0;

    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });

    if (!already) {
        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks];
            }, [])
            .filter((hook) => hook.orgasm === true);

        if (lastHooks.length + 1 >= number) {
            await User.findByIdAndUpdate(user.id, {
                $push: { achievements: nameOfAchievement.id },
            });
        }
    }

    return gain;
}

async function checkProtection(user, achievmentName, number) {
    const nameOfAchievement = await Achievement.findOne({ name: achievmentName });

    // let gain = 0;

    let already = false;

    user.achievements.forEach((achievement) => {
        if (achievement.toString() === nameOfAchievement.id) {
            already = true;
        }
    });

    if (!already) {
        const lastHooks = user.partners
            .reduce((acc, cur) => {
                return [...acc, ...cur.hooks];
            }, [])
            .filter((hook) => hook.protection === true);

        if (lastHooks.length + 1 >= number) {


            await User.findByIdAndUpdate(user.id, {
                $push: { achievements: nameOfAchievement.id },
            });
        }
    }


}

module.exports = {
    checkAchievement,
    checkDesert,
    checkShark,
    checkNumber,
    checkGrade,
    checkOrgasm,
    checkProtection,
    firstHook
};
