// 生成随机数据的辅助函数
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const randomPrice = () => (Math.random() * 100).toFixed(2)

// 模拟数据
export const mockIngredients = [
    {
        id: 1,
        name: '高筋面粉',
        category: 'main',
        price: 5.5,
        unit: 'kg',
        stock: 500,
        minStock: 100,
        maxStock: 1000,
        updateTime: new Date().toISOString(),
        remark: '面包专用粉'
    },
    {
        id: 2,
        name: '糖粉',
        category: 'sub',
        price: 8.8,
        unit: 'kg',
        stock: 80,
        minStock: 50,
        maxStock: 200,
        updateTime: new Date().toISOString(),
        remark: '细砂糖'
    },
    {
        id: 3,
        name: '黄油',
        category: 'main',
        price: 68,
        unit: 'kg',
        stock: 150,
        minStock: 50,
        maxStock: 300,
        updateTime: new Date().toISOString(),
        remark: '动物黄油'
    },
    {
        id: 4,
        name: '鸡蛋',
        category: 'main',
        price: 15,
        unit: 'kg',
        stock: 200,
        minStock: 100,
        maxStock: 500,
        updateTime: new Date().toISOString(),
        remark: '新鲜鸡蛋'
    },
    {
        id: 5,
        name: '酵母',
        category: 'sub',
        price: 35,
        unit: 'kg',
        stock: 20,
        minStock: 10,
        maxStock: 50,
        updateTime: new Date().toISOString(),
        remark: '即发酵母'
    },
    {
        id: 6,
        name: '盐',
        category: 'seasoning',
        price: 3,
        unit: 'kg',
        stock: 100,
        minStock: 20,
        maxStock: 150,
        updateTime: new Date().toISOString(),
        remark: '精制盐'
    },
    {
        id: 7,
        name: '巧克力',
        category: 'main',
        price: 88,
        unit: 'kg',
        stock: 50,
        minStock: 20,
        maxStock: 100,
        updateTime: new Date().toISOString(),
        remark: '比利时进口黑巧克力'
    },
    {
        id: 8,
        name: '淡奶油',
        category: 'main',
        price: 42,
        unit: 'l',
        stock: 120,
        minStock: 50,
        maxStock: 200,
        updateTime: new Date().toISOString(),
        remark: '动物性淡奶油'
    },
    {
        id: 9,
        name: '香草精',
        category: 'seasoning',
        price: 180,
        unit: 'l',
        stock: 5,
        minStock: 2,
        maxStock: 10,
        updateTime: new Date().toISOString(),
        remark: '马达加斯加香草精'
    },
    {
        id: 10,
        name: '杏仁粉',
        category: 'sub',
        price: 120,
        unit: 'kg',
        stock: 30,
        minStock: 15,
        maxStock: 50,
        updateTime: new Date().toISOString(),
        remark: '烘焙专用杏仁粉'
    }
]

// 基础 CRUD API
export const getIngredients = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockIngredients)
        }, 500)
    })
}

export const addIngredient = (ingredient) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newIngredient = {
                ...ingredient,
                id: mockIngredients.length + 1,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
            }
            mockIngredients.push(newIngredient)
            resolve(newIngredient)
        }, 500)
    })
}

export const updateIngredient = (id, ingredient) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = mockIngredients.findIndex(item => item.id === id)
            if (index !== -1) {
                mockIngredients[index] = {
                    ...mockIngredients[index],
                    ...ingredient,
                    updateTime: new Date().toISOString()
                }
                resolve(mockIngredients[index])
            }
        }, 500)
    })
}

export const deleteIngredient = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = mockIngredients.findIndex(item => item.id === id)
            if (index !== -1) {
                mockIngredients.splice(index, 1)
            }
            resolve(true)
        }, 500)
    })
}

// 库存相关 API
export const getStockStats = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const stats = {
                totalValue: mockIngredients.reduce((sum, item) => sum + item.price * item.stock, 0),
                stockWarning: mockIngredients.filter(item => item.stock < item.minStock).length,
                stockSufficient: mockIngredients.filter(item => item.stock >= item.minStock).length,
                stockEmpty: mockIngredients.filter(item => item.stock <= 0).length,
                categoryDistribution: {
                    main: mockIngredients.filter(item => item.category === 'main').length,
                    sub: mockIngredients.filter(item => item.category === 'sub').length,
                    seasoning: mockIngredients.filter(item => item.category === 'seasoning').length,
                    other: mockIngredients.filter(item => item.category === 'other').length
                },
                stockHistory: [
                    { date: '2024-03-01', value: 125000 },
                    { date: '2024-03-02', value: 128000 },
                    { date: '2024-03-03', value: 122000 },
                    { date: '2024-03-04', value: 130000 },
                    { date: '2024-03-05', value: 135000 },
                    { date: '2024-03-06', value: 132000 },
                    { date: '2024-03-07', value: 138000 }
                ]
            }
            resolve(stats)
        }, 500)
    })
}

export const getStockRecords = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const records = mockIngredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.name,
                records: Array(7).fill(0).map((_, index) => ({
                    date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    inStock: randomBetween(0, 100),
                    outStock: randomBetween(0, 50)
                }))
            }))
            resolve(records)
        }, 500)
    })
}

export const adjustStock = (id, amount, type, remark) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = mockIngredients.findIndex(item => item.id === id)
            if (index !== -1) {
                const ingredient = mockIngredients[index]
                ingredient.stock = type === 'increase'
                    ? ingredient.stock + amount
                    : ingredient.stock - amount
                ingredient.updateTime = new Date().toISOString()
                resolve(ingredient)
            }
        }, 500)
    })
} 