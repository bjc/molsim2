function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function ordinalSuffix(v) {
    let n = Number(v)
    if (n > 20) {
	n = n % 10
    }

    switch (n) {
    case 1:
	return 'st'
    case 2:
        return 'nd'
    case 3:
        return 'rd'
    default:
        return 'th'
    }
}

function testOrdinalSuffix() {
    const tests = {1: 'st',
                   2: 'nd',
                   3: 'rd',
                   4: 'th',
                   10: 'th',
                   11: 'th',
                   12: 'th',
                   13: 'th',
                   14: 'th',
                   20: 'th',
                   21: 'st',
                   32: 'nd',
                   43: 'rd',
                   44: 'th',
                   100: 'th',
                   101: 'st'}
    for (const t of Object.keys(tests)) {
        const got = ordinalSuffix(t)
        const want = tests[t]
        console.assert(got === want,
                       `bad suffix for ${t}: ${got} !== ${want}`)
    }
}

export { ordinalSuffix, testOrdinalSuffix, randomItem }
