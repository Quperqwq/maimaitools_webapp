const version = 'SkyBlue-Woof'


/**@typedef {import('../../../app/types').apiResBody} apiResBody */
/**@typedef {import('../../../app/types').apiReqBody} apiReqBody */

/**仅在此脚本之内使用的全局变量 */
const _global = {
    title: 'maimaitools',
    /**@type {Object.<string, Element>} */
    element: {},
    /**
     * 尝试获取DOM的一个元素
     * @param {string} id_name 
     */
    getElement: (id_name, _iterations = 0) => {
        const {getElement: thisFunc, element: local_element} = _global
        const local_target = local_element[id_name]
        
        if (local_target instanceof Element) return local_target // 如果之前获取过直接返回缓存的DOM对象

        const element = getEBI(id_name)
        if (element === null) return thisFunc(id_name, _iterations + 1) // 如果元素不存在则迭代获取

        _global.element[id_name] = element
        if (_iterations > 20) throw new Error('info bar Element not fond') // 如果迭代次数大于这个数字将抛出错误
        return element
    }
}

/** 用于此APP的全局设置 */
const setting = {
    /** 获取URL */
    url: {
        /** 获取`全国音游地图`URL */
        'music_map': (id) => {
            return `https://map.bemanicn.com/shop/${id}`
        }
    },
    /** 引用外联资源 */
    resource: {
        /** 当developers为true时引用以下资源 */
        dev: {
            'js': [
                '/script/__dev.js'
            ],
            'css': [
                '/style/__dev.css'
            ]
        },
        normal: {

        }
    },
    /** 导航栏的内容 */
    nav: [
        {
            title: '首页',
            href: '/',
            icon: 'icon-home'
        },
        {
            title: '机厅管理',
            href: '/hall',
            icon: 'icon-game'
        },
        {
            title: '帮助文档',
            href: '/document',
            icon: 'icon-news'
        },
        {
            title: '关于我们',
            href: '/about',
            icon: 'icon-info'
        },
    ],
    /**用户使用的浏览器类型 @type {string} */
    browser_type: '',
    /** 是否为开发者 */
    is_developers: false
}

/**
 * 请求一个API
 * @param {string} target 请求目标
 * @param {apiReqBody} req_data 响应体
 * @param {function(apiResBody, err)} callback 当请求完成时会触发此函数, 并传入响应体
 */
const useApi = (target, req_data = {}, callback) => {
    req_data.target = target
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api', true)
    const req_body = JSON.stringify(req_data)

    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = () => {
        if (xhr.status === 200) {
            const res_data = JSON.parse(xhr.responseText)
            if (typeof (callback) === 'function') callback(res_data, res_data.message)
        } else {
            console.error('use api failed.')
        }
    }
    xhr.onerror = () => {
        console.error('Request fail', xhr.status)
        
        return typeof(callback) === 'function' ? callback({}, 'req_fail') : void 0
    }


    xhr.send(req_body)
}



// DOM

/**
 * (DOM)设置一个数组为元素内容
 * @param {Element} element 目标元素
 * @param {string[]} value 设置目标值
 */
const setArrayContent = (element, value) => {
    if (!Array.isArray(value)) throw Error('invalid_type')
    // 销毁之前的元素
    const last_e_value = element.querySelector('.array-value')
    if (last_e_value) {
        last_e_value.remove()
    }
    /**
     * 添加一个条目
     * @param {string} cont 
     */
    const addItem = (cont, class_set = []) => {
        const e_item = create('li', true, {
            class: 'item ' + class_set.join(' ')
        }, cont)
        e_root.appendChild(e_item)
    }
    const e_root = create('ul', true, {class: 'array-value'})
    if (value.length <= 0) {
        addItem('无内容', ['not-have'])
    } else {
        value.forEach(cont => addItem(cont) )
    }
    join(element, e_root)
    return element
}

// 20241211之前的写法
// /**
//  * (DOM)(document.createElement)创建一个元素
//  * @param {string} tag_name 传入标签名
//  * @param {Object.<string, string>} tag_attrib 标签的属性
//  * @param {string | number | function(MouseEvent, element)} cont_or_func 标签内容, 或点击事件的回调函数
//  * @param {number | string} [bool_or_str] 指定为true将tag_content(时间戳)的值转换为可读的字符串样式; `cont_or_func`如果是function, 此值指定为字符串会将标签内容指定为此值
//  */
// const create = (tag_name, tag_attrib = {}, cont_or_func = '', bool_or_str = false) => {
//     const element = document.createElement(tag_name)
//     Object.keys(tag_attrib).forEach((name) => {
//         const value = tag_attrib[name]
//         element.setAttribute(name, value)
//     })

//     const setInnerHtml = value => element.innerHTML = value

//     switch (typeof cont_or_func) {
//         case 'string':
//             setInnerHtml(cont_or_func)
//             break
//         case 'number':
//             if (!bool_or_str) {
//                 setInnerHtml(cont_or_func)
//                 break
//             }
//             // setInnerHtml(App.toStrTime(cont_or_func))
//             break
//         case 'function':
//             element.addEventListener('click', (event) => {
//                 cont_or_func(event, element)
//             })
//             if (typeof bool_or_str === 'string') {
//                 element.innerHTML = bool_or_str
//             }
//         default:
//             break
//     }
//     return element
// }

// 20241211后已将此方法重构
/**
 * (DOM)(document.createElement)快捷地创建一个元素
 * @param {string} tag_name 需要创建的标签名
 * @param  {...number | string[] | string | Object.<string, string> | function(MouseEvent, element) | Element} args
 * #### 当值`args`为以下类型时为目标元素更改指定属性  
 * - `string`: 内容;  
 * - `Object`: 元素对象的初始属性;    
 * - `function`: 当点击该元素时触发的回调函数;  
 * - `array`: 为元素创建一个内容列表;
 * - `bool`: 使用原始值作为innerText;
 * - `Element`: 为创建的元素添加一个子元素
 */
const create = (tag_name, ...args) => {
    /** 目标元素 */const element = document.createElement(tag_name)
    /** 当点击时触发的回调 */let callback = null
    /** 使用原始值 */let use_org = false
    
    /**
     * 设置目标元素的内容
     * @param {any} value 
     */
    const setContent = (value) => {
        element.innerText = `${value}`
        return
    }

    element.addEventListener('click', (event) => {
        if (!(typeof(callback) === 'function')) return
        callback(event, element)
    })

    args.forEach((arg) => {
        switch (typeof(arg)) {
            case 'string':
                // 值为字符串时设置该值为元素的内容
                setContent(arg)
                break
            case 'object':
                // fork.1) 值为数组时为元素创建一个内容列表
                if (Array.isArray(arg)) {
                    if (use_org) return setContent(arg)
                    setArrayContent(element, arg)
                    break
                }
                // fork.2) 值为DOM元素为此元素添加这个值为子元素
                if (arg instanceof Element) {
                    element.appendChild(arg)
                    break
                }

                // default) 值为对象时设置元素的属性
                Object.keys(arg).forEach((attrib_name) => {
                    const attrib_value = arg[attrib_name]
                    element.setAttribute(attrib_name, attrib_value)
                })
                break
            case 'function':
                // 为函数时更改回调函数
                callback = arg
                break
            case 'number':
                if (use_org) return setContent(arg)
                // 值为数字时(默认认为此值为时间戳)将该值转换为可读的字符串样式
                
                const date = getTime(arg)
                element.innerText = date
                break
            case 'boolean':
                use_org = true
                break
            default:
                break
        }
        return
    })

    return element
}


/**
 * (DOM)(Element.appendChild)组合元素
 * @param {Element} root_element 根(父)元素
 * @param {any} child_elements 子元素
 * 
 */
const join = (root_element, child_elements) => {
    if (!child_elements) return
    if (child_elements instanceof Element) {
        root_element.appendChild(child_elements)
        return root_element
    }
    if (Array.isArray(child_elements)) {
        child_elements.forEach((element) => {
            if (!(element instanceof Element)) return
            root_element.appendChild(element)
        })
        return root_element
    }

    child_elements = Object.values(child_elements)
    child_elements.forEach((element) => {
        if (!(element instanceof Element)) return
        root_element.appendChild(element)
    })
    return root_element
}

/**
 * (DOM)getElementById
 * @param {string} id_name
 */
const getEBI = (id_name) => {
    const element = document.getElementById(id_name)
    if (!element) console.warn('script get element fail! id name is ', id_name)
    return element
}

/**
 * 获取一个Element数组的所有值
 * @param {HTMLInputElement[]} element_list 
 * @returns {string[]}
 */
const getElementsValue = (element_list) => {
    return element_list.map(input => input.value)
}

/**
 * 获取一个Element数组被选中的Element的值
 * @param {HTMLInputElement[]} element_list 
 * @returns {string[]}
 */
const getCheckedElement = (element_list) => {
    const output = []
    element_list.forEach((element) => {
        if (!element.checked) return
        output.push(element.value)
    })
    return output
}

/**
 * (DOM)querySelectorAll
 * @param {string} query CSS查询参数
 * @param {string} [id_name] 父元素id, 若未指定将默认从document内查询
 */
const getQSA = (query, id_name, __debug) => {
    const target = id_name ? getEBI(id_name) : document
    if (__debug) console.log('select target:', target)
    
    if (!target) return []
    return target.querySelectorAll(query)
}

/**
 * (DOM)querySelector
 * @param {string} query 
 * @param {string} id_name 
 */
const getQS = (query, id_name) => {
    return getQSA(query, id_name)[0]
}

/** 
* (DOM)获取对象内所有ID对应在DOM内的元素
* @param {Object.<string, Object | string>} obj 需要获取元素的对象
* @returns {Object.<string, Object | Element>}
*/
const getElements = (obj) => {
    let new_obj = {}
    Object.keys(obj).forEach((key) => {
        const value = obj[key]
        if (!(typeof value === 'string')) {
            new_obj[key] = getElements(value)
        } else {
            new_obj[key] = getEBI(value)
        }
    })
    return new_obj
}



// class

class InputList {
    /**
     * (DOM)绑定两个元素, 并创建一个输入添加或删除的列表
     * @param {Element} list_element 列表元素(通常是<ul>,<ol>等列表元素)
     * @param {HTMLInputElement} input_element 输入元素
     * @param {string[]} [values] 指定初始值
     */
    constructor(list_element, input_element, values) {
        /** 所有输入的值 @type {object.<string, Element>} */
        this._value = {}
        list_element.replaceChildren()

        this.list_element = list_element
        this.input_element = input_element

        if (values) this.setValue(values)


        // 添加
        input_element.addEventListener('blur', () => {
            const { value } = input_element
            input_element.value = ''
            if (!value) return // 如果用户没有输入内容将不会添加

            this.appendValue(value)
        })
    }

    /**
     * 向列表后添加一个元素
     * @param {string} value 
     */
    appendValue(value) {
        this._value[value] = this.list_element.appendChild(
            create('li', { class: 'item' }, (event) => {
                // (ADD)这里以后需要添加销毁DOM的操作, 而非使用CSS隐藏元素
                event.target.classList.add('not')
                delete this._value[value]
            }, value)
        )
    }

    /**
     * 设置输入值
     * @param {string[]} values 
     */
    setValue(values) {
        values.forEach((value) => {
            this.appendValue(value)
        })
    }

    /**重置输入元素 */
    reset() {
        this._value = {}
        this.list_element.replaceChildren()
        
    }

    /**输入列表 */
    get value() {
        return Object.keys(this._value)
    }
}

/**
 * 网页cookie的内容
 */
class Cookie {
    constructor() {
        this.content = this._get()
    }
    _get() {
        const cookies = document.cookie
        /**字符内容映射表, 若cookie的value与键相同将会被转换为该值 */
        const mapping = {
            'true': true,
            'false': false
        }

        let content = {
            /**
             * 获取cookie的某个值
             * @param {string} key 需要获取的字段名(键)
             * @param {any} normal 若该值不存在指定一个默认值
             * @returns {string | null}
             */
            get: (key, normal = null) => {
            const cont = content[key]
            return cont === null ? normal : cont
        }}
        if (!cookies) return content
        const mapping_key = Object.keys(mapping)
        const cookie_list = cookies.split('; ')
        cookie_list.forEach((cookie) => {
            const item = cookie.split('=')
            let value = item[1]
            let key = item[0]
            const _case = value.toLowerCase()
            if (mapping_key.includes(_case)) {
                // 映射为指定内容
                value = mapping[_case]
            }
            content[key] = value
        })
        return content
    }

    /**
     * 获取一个cookie的内容
     * @param {string} key cookie对应的键
     * @returns {string | boolean | undefined}
     */
    get(key) {
        const value = this.content.get(key, null)
        // console.log('cookie value: ', key, ':', value)
        
        return value
    }

    /**
     * 删除一个cookie内容
     * @param {string} key 
     */
    del(key, path = '/') {
        this.content[key] = undefined
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`
    }

    /**
     * 设置一个Cookie内容
     * @typedef {Object} CookieConfig
     * @property {number} expires 设置过期时间(天)
     * @property {string} path 设置Cookie路径
     * @property {boolean} _is_org 设置为原始值不进行URL编码
     * @param {string} key 
     * @param {string | function(string | undefined): string} value 
     * @param {CookieConfig} param2
     */
    set(key, value = '', {expires = 365, path = '/', _is_org} = {}) {
        const date = new Date()
        date.setTime(date.getTime() + (expires * 86400000))
        const expires_time = date.toUTCString()

        let new_value = value

        if (typeof (value) === 'function') {
            new_value = value(this.get(key))
        }

        // // 如果是新值
        // if (!this.get(key)) {

        // }

        document.cookie = `${key}=${_is_org ? new_value : encodeURIComponent(new_value)}; expires=${expires_time}; path=${path};`

        this.content[key] = new_value
    }

    /**
     * 设置一个Cookie的内容的项目(将Cookie内容自动转换为对象)
     * @param {string} key 
     * @param {Object.<string, any>} value 
     * @param {CookieConfig} [config] 
     */
    setObj(key, value = {}, config = {}) {
        this.set(key, JSON.stringify(value), config)
    }

    /**
     * 获取一个Cookie内容对象(必须为Object编码后的内容)
     * @param {string} key 
     */
    getObj(key) {
        try {
            return JSON.parse(decodeURIComponent(this.get(key)))
        } catch (error) {
            return {}
        }
    }

    /**
     * 获取对应Cookie内容的`Array`形式
     * @param {string} key 
     * @param {boolean} _is_org 按照原始值获取(未解码的)
     */
    getArrayData(key, _is_org = false) {
        // (i)这里以后可以做性能优化
        const cont = this.get(key)
        if (!cont) return []
        
        const value = cont.split(',')
        
        return _is_org ? value : value.map((value) => {
            return decodeURIComponent(value)
        })
    }

    /**
     * 更改对应Cookie`Array`内容的值
     * @param {string} key 
     * @param {function(string[]):string[]} method 更改数组的方法, 将传入键对应的Array形式
     */
    changeArrayData(key, method, _is_org = false) {
        const cont = this.getArrayData(key, _is_org)
        const value = method(cont).join(',')
        this.set(key, value, {'_is_org': true})
        this.content[key] = value
        console.log(value);
        
    }

    /**
     * 添加一个Cookie的内容的项目(将Cookie内容自动转换为Array对象)
     * @param {string} key 
     * @param {string[]} value
     */
    addItem(key, ...value) {
        this.changeArrayData(key, (cont) => {
            cont.push(...(value.map((item) => {
                return encodeURIComponent(item)
            })))
            return cont
        }, true)
    }

    /**
     * 更改一个Cookie的内容的项目(将Cookie内容自动转换为Array对象)
     * @param {string} key 
     * @param {string[]} value
     */
    setItem(key, ...value) {
        this.changeArrayData(key, () => {
            return value.map((item) => {
                return encodeURIComponent(item)
            })
        }, true)
    }

    /**
     * 删除一个Cookie的内容的项目
     * @param {string} key 
     * @param {string} value
     */
    delItem(key, value) {
        this.changeArrayData(key, (cont) => {
            return cont.filter(item => item !== `${value}`)
        })
    }
}
const cookie = new Cookie()

/**
 * 设置LocalStorage
 */
class SetLocalStorage {
    constructor () {}

    /**
     * 设置一个LocalStorage
     * @param {string} key 设置键
     * @param {any} value 设置值
     */
    set(key, value) {
        let set_value = ''
        if (typeof(value) === 'string') {
            set_value = value
        } else {
            set_value = JSON.stringify(value)
        }
        localStorage.setItem(key, set_value)
    }

    /**
     * 获取一个LocalStorage的指定键内容
     * @param {string} key 指定键
     * @param {any} [normal] 如果不存在该值将返回这个默认值
     */
    get(key, normal = '') {
        let result = localStorage.getItem(key)
        if (result === null) return normal
        try {
            result = JSON.parse(result)
        } catch (e) {}
        return result
    }

    /**
     * 删除一个LocalStorage的指定键内容
     * @param {string} key 指定键
     * @returns {never}
     */
    del(key) {
        localStorage.removeItem(key)
    }
}
/**通过快捷方式设置LocalStorage */
const local = new SetLocalStorage()


/**一个简单的排序算法 */
class Sorting {
    /**
     * 
     * @param {boolean} reverse 是否为逆序
     */
    constructor(reverse = false) {
        this.is_reverse = reverse
        // console.log('is_reverse: ', this.is_reverse);
        
        /**@type {string[] | number[]}} */
        this.basis = []
        /**
         * basis列表对应值
         * @type {{ [x: string | number]: any[] }}
         */
        this.value = {}
    }

    /**
     * 往排序列表添加一个排序值
     * @param {string | number} new_basis 排序依据
     * @param {any} new_value 该依据对应的值
     */
    addItem(new_basis, new_value) {
        // 创建引用
        const values = this.value
        const basis = this.basis
        /**原数组basis长度 */
        const org_basis_len = basis.length
        const appendValue = () => {
            // 确保一个basis对应着一个value
            const item = values[new_basis]
            if (!item) {
                values[new_basis] = [new_value]
                return
            }
            item.push(new_value)
        }
        appendValue()

        // 在进入这里之前需要确保org_basis_len的值是number

        if (org_basis_len <= 0) {
            // 确保basis不是空数组
            return basis.push(new_basis)
        }
        if (basis.includes(new_basis)) {
            // 如果存在这个值则不进行下一步排序
            return
        }
        if (basis[0] >= new_basis) {
            // 为最小值
            return basis.unshift(new_basis)
        }
        for (let index = 0; index < org_basis_len; index++) {
            // 比对列表内所有对象进行排序
            /**数组内的值 */
            const arr_basis = basis[index]
            
            // console.log(arr_basis, '>', new_basis, +arr_basis > +new_basis);
            
            if (+arr_basis > +new_basis) {
                basis.splice(index, 0, new_basis)
                break
            }
        }
        if (org_basis_len === basis.length) {
            // 没有插入说明是最大值
            // console.log('最大', new_basis);
            
            basis.push(new_basis)
        }
    }

    /**
     * 往排序列表添加排序值, 其中对象的键是排序依据, 对象的值是该依据对应的值
     * @param {{[x: string | number]: any}} obj 
     */
    add(obj) {
        Object.keys(obj).forEach((key) => {
            const value = obj[key]
            this.addItem(key, value)
        })
    }

    getValues() {
        const returns = []
        
        // console.log('value is:', this.value, ';basis is:', this.basis, '\nnow running function:');
        
        this.basis.forEach((index, sub) => {
            // console.log('index of:', index, ';value of:', ...this.value[index])
            returns.push(...this.value[index])
        })
        
        return this.is_reverse ? returns.reverse() : returns
    }
}

class Dev {
    constructor() {}
    
    printElementSize(element = document.body) {
        console.log('width of: ', element.clientWidth, ', height of: ', element.clientHeight)
        return element
    }
}
const dev = new Dev()

/**获取DOM操作的快捷方式 */
class GetDom {
    constructor() {
        this.target = null
    }

    /**
     * 设置一个新的依据目标
     * @param {string | Element} element 
     */
    setTarget(element) {
        /** @type {null | Element} */
        let target = element
        if (typeof(element) === 'string') {
            target = getEBI(element)
        }
        if (!(target instanceof Element)) {
            throw new Error('target not found.', element)
        }
        this.target = target
        return target
    }

    /**
     * 通过`setTarget`设置的值获取一个匹配的元素
     * @param {string} query 选择器
     */
    get(query) {
        if (!(this.target instanceof Element)) return null
        return this.target.querySelector(query)
    }

    /**
     * 通过`setTarget`设置的值获取一组匹配的元素
     * @param {string} query 选择器
     */
    getAll(query) {
        if (!(this.target instanceof Element)) return []
        return this.target.querySelectorAll(query)
    }
}

class PageNav {
    /**
     * 构建一个`PageNav`类, 用于做页面选择使用  
     * ( ! ) 需要配合`page-nav`模板使用
     * @param {Element} element 
     * @param {any[]} data 需要进行创建的数组
     * @param {Object} param2 配置信息
     * @param {number} [param2.chunk_size=10] 一页显示的元素数量
     * @param {number} [param2.max_display_page=5] 最大显示页码数量, 最小为5
     */
    constructor(element, data, {
        chunk_size = 10,
        max_display_page = 5
    } = {}) {
        if (!(element instanceof Element)) {throw new Error('invalid element.')}

        const getDoc = () => {
            const dom = new GetDom()
            return {
                root: dom.setTarget(element),
                list: dom.get('ul.page-list'),
                input: {
                    last: dom.get('button.last'),
                    next: dom.get('button.next')
                }
            }
        }
        const initDoc = () => {
            const {input: {last, next}, list, root} = doc
            // 点击上一页
            last.addEventListener('click', () => {
                this.switchPage(this.index - 1)
            })
            // 点击下一页
            next.addEventListener('click', () => {
                this.switchPage(this.index + 1)
            })
            // 事件委托 > 点击页码内元素
            list.addEventListener('click', (event) => {
                const {target} = event
                if (!target.classList.contains('index-item')) return
                this.switchPage(+target.dataset.index)
            })

            root.classList.add('show')
        }
        const initData = () => {
            // 将内容按照组大小分割
            const length = data.length
            const result = []
            const group_sum = Math.floor(length / chunk_size) + 1
            let last_index = 0
            for (let curr_group = 0; curr_group < group_sum; curr_group++) {
                // console.log('index of:', last_index, '; from ', last_index, ', to', chunk_size + last_index);
                const chunk = data.slice(last_index, chunk_size + last_index)
                if (chunk.length <= 0) continue
                result.push(chunk)
                last_index += chunk_size
            }
            return result
        }
        
        const doc = getDoc()

        initDoc()
        const result_data = initData()

        // 初始化对象值
        this.data = result_data
        this.max_display_page = max_display_page < 5 ? 5 : max_display_page
        /**组的数量 */
        this.length = result_data.length
        this.doc = doc
        /**当前页的索引 */
        this.index = 1
        /**单页显示元素的数量 */
        this.item_per = chunk_size
        /**页码映射为数组索引 */
        this.data_index = Array.from({ length: this.length }, (_, index) => index + 1)
        this.onSwitchPage = null

        this.switchPage()
    }

    /**
     * 当更改页面时触发回调函数
     * @param {function(number, any[]): void} callback 
     */
    set onSwitch(callback) {
        /**当更改页面时触发回调函数 @type {null | function(number, any[]): void} */
        this.onSwitchPage = callback
        this.switchPage()
    }

    /**
     * 切换当前页
     * @param {number} index 切换到索引
     */
    switchPage(index = this.index) {
        const initDom = () => {
            /** (`create`的引用)创建一个元素 */
            const createItem = (...args) => {
                es_list.push(create('li', true, ...args))
            }
            /**
             * 创建一个页索引元素
             * @param {number} index_of 创建的index
             */
            const createIndexItem = (index_of) => {
                
                const class_set = 'index-item' + (index_of === curr_index ? ' current' : '')
                es_list.push(createItem({
                    'class': class_set,
                    'data-index': index_of
                }, index_of))
            }
            const {list} = this.doc
            const visible = 5
            const start = 1
            list.innerHTML = ''
            const es_list = []
            let start_index = curr_index - start
            let end_index = curr_index - visible + max_display_page
            if (start_index <= 0) {
                start_index = 0
                end_index = max_display_page
            }

            if (end_index >= length) {
                start_index = length - max_display_page + visible - start
                end_index = length
            }

            // console.debug('[PageNav] max_display_page:', max_display_page, ', round:', round, ', index of:', curr_index, ', start:', start_index, ', end:', end_index)
            console.debug('[PageNav] max_display_page:', max_display_page, ', index of:', curr_index, ', start:', start_index, ', end:', end_index)
            
            // 页码前省略号
            if (start_index > 0) {
                createIndexItem(1)
                if ((start_index - 1) !== 0) {
                    createItem({'class': 'other'}, '...')
                }
            }


            // 页码生成
            this.data_index.slice(start_index, end_index).forEach((index) => {
                createIndexItem(index)
            })

            // 页码后输入框
            if ((end_index < length) && (start_index !== 0)) {
                if ((end_index + 1) !== length) {
                    const e_input = create('input', {
                        type: 'number',
                        placeholder: '跳转至'
                    })
                    // 当输入框元素失焦时触发切换页码
                    e_input.addEventListener('blur', () => {
                        const switch_target = +e_input.value
                        if (!switch_target) return
                        this.switchPage(switch_target)
                    })
                    createItem({class: 'other input'}, e_input)
                }
                createIndexItem(length)
            }
            join(list, es_list)
        }
        let curr_index = index
        const {length, data, max_display_page, onSwitchPage} = this
        if (1 > index) curr_index = 1 // 确保页码合法
        if (length < index) curr_index = length

        // if (this.index === curr_index) return
        
        this.index = curr_index
        const result = data[curr_index - 1]
        this.result = result
        initDom()
        if (typeof(onSwitchPage) === 'function') { // 触发回调
            onSwitchPage(curr_index, result)
        }
        return result
    }
}

/** 用于快捷操作`picnic.css`导航栏 */
class DocumentNav {
    /**
     * 构建一个`picnic.css`导航栏的类
     * @param {Element} [nav_element] 
     */
    constructor(nav_element = getEBI('main-nav')) {
        if (!(nav_element instanceof Element)) {throw new Error('element not found.')}

        const dom = new GetDom()

        this.dom = dom
        this.doc = {
            root: dom.setTarget(nav_element),
            title: dom.get('.brand .title'),
            logo: dom.get('.brand .logo'),
            menu: {
                root: dom.setTarget(
                    dom.get('.menu')
                ),
                items: dom.getAll('.menu-item'),
                title: dom.get('.title'),
            },
        }
    }

    /**
     * 刷新引用
     */
    _refreshNavRef() {
        this.doc.menu.items = this.doc.menu.root.querySelectorAll('.menu-item')
    }

    /**
     * 添加一个导航菜单的内容
     * @param {string} title 
     * @param {string} href 
     * @param {string} icon_set 
     * @param {boolean} [is_target] 
     */
    add(title, href, icon_set, is_target = false) {
        const {doc} = this
        const class_name = 'menu-item pseudo button ' + valid(icon_set, '') + (is_target ? ' target' : '')
        join(doc.menu.root, create('a', {
            href: href,
            class: class_name
        }, title))

        this._refreshNavRef()
    }
}

/**
 * 冒出一个消息提示
 * @param {string} message 弹出消息内容
 * @param {object} setting 样式设置
 * @param {number} setting.show_time 样式设置
 * @param {boolean} setting.keep 保持提示信息不消失
 * @param {number} _iterations *表示该函数迭代了多少次, 一般不会使用*
 */
const infoBar = (message = '', setting = {
    'show_time': 2000,
    'keep': false
}, _iterations = 0) => {
    const { show_time, keep } = setting
    let { timeout_info_bar } = _global
    // if (!(e_info_bar instanceof Element)) {
    //     _global.e_info_bar = getEBI('info-bar')
    //     if (_iterations > 20) throw new Error('info bar Element not fond') // 如果迭代次数大于这个数字将抛出错误
    //     return infoBar(message, setting, _iterations + 1)
    // }
    const e_info_bar = _global.getElement('info-bar')
    if (timeout_info_bar) clearTimeout(timeout_info_bar)

    e_info_bar.querySelector('.content').innerText = message
    e_info_bar.classList.add('show')
    if (keep) return
    _global.timeout_info_bar = setTimeout(() => {
        e_info_bar.classList.remove('show')
    }, show_time)
}

/**
 * 显示一个等待框, 在等待时用户不可对界面交互
 * @param {boolean} is_wait 
 * @param {string} message 
 */
const waitBar = (is_wait = true, message = '') => {
    // ~(ADD)可以把等待框做成舞萌主题"与服务器通讯中"的样式
    const e_wait_bar = _global.getElement('wait-bar')

    if (message) e_wait_bar.querySelector('.content').innerText = message
    if (is_wait) {
        e_wait_bar.classList.add('show')
    } else {
        e_wait_bar.classList.remove('show')
    }
}


// tool & dev


// # time



/**
 * 获取时间的可读字符串样式
 * @param {number} [time] 若不指定将会使用默认系统时间
 * @returns {string}
 */
const getTime = (time) => {
    const _toNowTime = (time) => {
        const date = new Date(time)
        const padZero = (num) => String(num).padStart(2, '0')
        return `${date.getFullYear()}年${padZero(date.getMonth() + 1)}月${padZero(date.getDate())}日 ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`
    }
    const _toTime = (time) => {

        // (i)注意: 以下代码由AI代写
        let days = Math.floor(time / 86400) // 计算天数
        let hours = Math.floor((time % 86400) / 3600) // 计算小时
        let minutes = Math.floor((time % 3600) / 60) // 计算分钟
        let seconds = time % 60 // 计算秒

        let time_description = []

        if (days > 0) {
            time_description.push(`${days}天`)
        }
        if (hours > 0) {
            time_description.push(`${hours}小时`)
        }
        if (minutes > 0) {
            time_description.push(`${minutes}分钟`)
        }
        if (seconds > 0) {
            time_description.push(`${seconds}秒`)
        }
        return valid(time_description.join(''), '刚刚')
    }
    if (time > 100000000000) return _toNowTime(time)
    if (!time) return _toNowTime(new Date().getTime())

    return _toTime(Math.round(time / 1000))

}

/**
 * 获取一天所处的时间段`0~1440`
 */
const getDayTime = () => {
    const date = new Date()
    return (date.getHours() * 60) + date.getMinutes()
}

/**
 * 获取一天的某个时间(0~1440)
 * @param {number | string} time 
 */
const toDayTime = (time) => {
    if (time === null || time === void 0) return null
    if (time < 0) time = 0
    if (time > 1440) time = 1440
    if (time === 1440) time = 0
    if (time === '') time = '0:0'
    const num_time = +time
    if (Number.isNaN(num_time)) {
        // string的时间格式
        const str_time = time.split(':')
        return (+str_time[0] * 60) + +str_time[1]
    }
    // number的时间格式
    const hours = Math.floor(time / 60)
    
    const minutes = time - (hours * 60)
    const padZero = (num) => String(num).padStart(2, '0')
    return `${padZero(hours)}:${padZero(minutes)}`
}

/**
 * 获取一个时间是否过期
 * @param {number} time 被检查时间
 * @param {number} limit 此时间后算作过期
 */
const isExpiredTime = (time, limit) => {
    const this_time = timeIs()
    return this_time > (time + limit)
}


// # other


/**
 * 获取两个对象不重复(或重复)的值, 将会返回重复字段的内容(确保两个对象的键一致, 将会比对值)
 * @param {object} org_obj 原始值
 * @param {object} new_obj 新值
 * @param {boolean} _get_rep 获取重复内容的值
 * @returns {object}
 * @example 
 * getObjRepCont({
 * 'key1': 'old_value', 'key2': 'old_value'
 * }, {
 * 'key1': 'old_value', 'key2': 'new_value'
 * }) // {'key2', 'new_value'}
 */
const getObjRepCont = (org_obj, new_obj, _get_rep = false) => {
    const output = {}
    /**
     * 尝试将字符串转换为number， 否则将是原值
     * @param {any} num 
     */
    const toNumber = (num) => {
        const new_num = +num
        return Number.isNaN(new_num) ? num : new_num
    }
    /**
     * 判断两个值是否相等
     * @param {any} org 
     * @param {any} rel 
     */
    const isEqual = (org, rel) => {
        switch (typeof(org)) {
            case 'string':
                return toNumber(org) === toNumber(rel)
            case 'object':
                return JSON.stringify(org) === JSON.stringify(rel)
            case 'number':
                return org === toNumber(rel)
            default:
                return org === rel
        }
    }
    Object.keys(org_obj).forEach((key) => {
        const org_value = toNumber(org_obj[key])
        const new_value = toNumber(new_obj[key])

        if (new_value === void 0) return
        if (_get_rep) {
            
            if (!isEqual(org_value, new_value)) return
        } else {
            if (isEqual(org_value, new_value)) return
        }
        output[key] = new_value
    })
    return output
}

/**
 * 获取当前时间戳
 */
const timeIs = () => {
    return new Date().getTime()
}

/**
 * 获取一个时间戳是现在的多少时间前(可读字符串样式)
 * @param {number} time 过去的某个时间戳
 */
const getElapsedTime = (time) => {
    return getTime(new Date().getTime() - time)
}


/**
 * 确保一个值有效
 * @param {any} value 指定需要检查的值
 * @param {any} normal 该值无效时指定的默认值
 */
const valid = (value, normal) => {
    if (Array.isArray(value)) return value.length > 0 ? value : normal
    return value ? value : normal
}

/**
 * 确保一个值符合预期类型
 * @param {any} value 需要检查的值
 * @param {'string' | 'number' | 'function' | 'boolean' | 'array'} is_type 预期类型
 * @param {any} normal 若不符合预期指定为默认值
 */
const validType = (value, is_type, normal) => {
    const type = is_type.toLowerCase()
    const the_type = typeof(value)
    if (the_type === type) return value

    let is_valid = false
    switch (is_type) {
        case 'array':
            is_valid = Array.isArray(value)
            break
        default:
            return normal
    }
    return is_valid ? value : normal
}


/**用于DEBUG时检查某个传单值 */
const print = (any) => {
    console.log(any)
    return any
} 


const __init = () => {
    const getBrowserType = () => {
        // (i)以下代码由AI编写
        const userAgent = navigator.userAgent

        // 检测浏览器类型
        if (userAgent.indexOf("Chrome") > -1) {
            return "chrome"
        } else if (userAgent.indexOf("Firefox") > -1) {
            return "firefox"
        } else if (userAgent.indexOf("Safari") > -1) {
            return "safari"
        } else if (userAgent.indexOf("Edge") > -1) {
            return "edge"
        } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
            return "ie"
        }
    }
    // 设置浏览器类型以便差异化实现特性
    setting.browser_type = getBrowserType()

    // 是否为开发者
    setting.is_developers = Boolean(cookie.get('developers'))

}
__init()

document.addEventListener('DOMContentLoaded', () => {
    /**
     * 为此页面引入其他资源
     * @typedef {'js' | 'css'} ImportType
     * @param {ImportType} type 引入类型
     * @param {string[]} src 引入路径
     */
    const importResource = (type, src) => {
        const result = []
        /**
         * 创建资源引用的方法
         * @type {{[key in ImportType]: function(string): Element}}
         */
        const create_map = {
            js: (src) => {
                return create('script', {src: src})
            },
            css: (src) => {
                return create('link', {rel: 'stylesheet', href: src})
            }
        }
        const createRE = create_map[type]

        src.forEach((href) => {
            result.push(createRE(href))
        })

        join(document.head, result)
    }


    // 初始化对象
    /** 导航栏的内容 */
    const nav_cont = setting.nav

    const nav = new DocumentNav()

    // title
    document.title = `${_global.title} - ${document.title}`

    // version
    const e_version = getEBI('version')
    if (e_version) e_version.innerText = version

    // Element set

    // 对于safari浏览器样式上进行差异化设置
    if (setting.browser_type === 'safari') { 
        document.body.classList.add('safari')
        join(document.head,
            [
                create('meta', {
                    name: 'viewport',
                    content: 'width=device-width,initial-scale=1,mininmum-scale=1,maximum-scale=1,user-scalable=no',
                    charset: 'UTF-8'
                }),
                create('meta', {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1, maximum-scale=1,user-scalable=0'
                })
            ]
        )
    }

    // 对于nav

    // 对于开发者增加引用内容
    if (setting.is_developers) {
        const {js, css} = setting.resource.dev
        importResource('js', js)
        importResource('css', css)
        nav_cont.push({
            title: '管理面板',
            href: '/admin',
            icon: 'icon-users'
        }, {
            title: '开发者面板',
            href: '/dev',
            icon: 'icon-debug'
        })
    }

    // 初始化nav
    nav_cont.forEach((nav_item) => {
        const page_path = location.pathname
        const {title, href, icon} = nav_item
        nav.add( title, href, icon, page_path === href )
    })
})