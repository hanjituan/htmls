export const mockEffects = [
    {
        id: 1,
        name: '高筋面粉',
        category: 'main',
        mainEffect: '富含蛋白质，能形成面团的筋力，是面包等发酵面点的主要原料。',
        usage: '适量使用，根据配方比例添加，一般在面团中占比50-65%。',
        safetyLevel: 95,
        safetyNote: '安全食材，一般人群可放心使用。'
    },
    {
        id: 2,
        name: '酵母',
        category: 'sub',
        mainEffect: '使面团发酵，产生二氧化碳，形成蜂窝状组织，赋予面包特有的香味。',
        usage: '用量为面粉重量的1-2%，温度过高或过低都会影响发酵效果。',
        safetyLevel: 85,
        safetyNote: '建议发酵充分后再食用，避免食用未发酵完全的面团。'
    },
    {
        id: 3,
        name: '黄油',
        category: 'main',
        mainEffect: '增加面团韧性和层次感，提供香浓口感，改善成品质地。',
        usage: '根据配方添加，一般在面团中占比15-25%，建议室温软化后使用。',
        safetyLevel: 75,
        safetyNote: '适量使用，高温烘烤时注意避免过度褐变。'
    },
    {
        id: 4,
        name: '糖粉',
        category: 'sub',
        mainEffect: '提供甜度，帮助酵母发酵，改善口感，促进表面褐变。',
        usage: '用量根据甜度要求调整，一般在面团中占比8-15%。',
        safetyLevel: 70,
        safetyNote: '糖分含量较高，糖尿病患者慎用。'
    },
    {
        id: 5,
        name: '盐',
        category: 'seasoning',
        mainEffect: '增强面筋网络强度，控制发酵速度，提升风味。',
        usage: '用量为面粉重量的1.5-2%，可根据个人口味适当调整。',
        safetyLevel: 80,
        safetyNote: '适量使用，高血压患者需要控制用量。'
    },
    {
        id: 6,
        name: '鸡蛋',
        category: 'main',
        mainEffect: '增加面团韧性，改善色泽，提供营养，增加口感。',
        usage: '可根据配方需求添加全蛋或蛋黄，一般在面团中占比15-20%。',
        safetyLevel: 90,
        safetyNote: '注意使用新鲜鸡蛋，过敏者慎用。'
    },
    {
        id: 7,
        name: '可可粉',
        category: 'sub',
        mainEffect: '提供巧克力风味和褐色，增加成品口感和外观。',
        usage: '用量为面粉重量的5-10%，添加时需要适当增加液体用量。',
        safetyLevel: 85,
        safetyNote: '咖啡因敏感者请适量使用。'
    },
    {
        id: 8,
        name: '泡打粉',
        category: 'sub',
        mainEffect: '化学发泡剂，使面团膨松，适用于制作蛋糕等点心。',
        usage: '用量为面粉重量的1-3%，加入后需要迅速烘烤。',
        safetyLevel: 75,
        safetyNote: '使用适量，避免过量影响口感。'
    },
    {
        id: 9,
        name: '淡奶油',
        category: 'main',
        mainEffect: '增加口感的细腻度，提供奶香味，改善质地。',
        usage: '根据配方添加，一般用于裱花和夹馅，使用前充分打发。',
        safetyLevel: 85,
        safetyNote: '需要冷藏保存，乳糖不耐受者慎用。'
    },
    {
        id: 10,
        name: '香草精',
        category: 'seasoning',
        mainEffect: '提供香草风味，增强甜点的香气层次。',
        usage: '少量使用，用量为液体重量的0.1-0.2%。',
        safetyLevel: 80,
        safetyNote: '建议选用天然香草精，孕妇慎用。'
    }
]

// 获取配料效果列表
export const getIngredientEffects = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockEffects)
        }, 300)
    })
} 