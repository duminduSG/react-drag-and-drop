export const treeWithTwoBranches = {
    rootId: '1',
    items: {
        '1': {
            id: '1',
            children: ['1-1', '1-2', '1-3'],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: 'root',
            },
        },
        '1-1': {
            id: '1-1',
            children: ['1-1-1', '1-1-2'],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: 'First parent',
            },
        },
        '1-2': {
            id: '1-2',
            children: ['1-2-1', '1-2-2'],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: 'Second parent',
            },
        },
        '1-3': {
            id: '1-3',
            children: ['1-3-1', '1-3-2'],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: 'Third parent',
            },
        },
        '1-1-1': {
            id: '1-1-1',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Child one',
                content: 'Child one'
            },
        },
        '1-1-2': {
            id: '1-1-2',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Child two',
                content: 'Child two'
            },
        },
        '1-2-1': {
            id: '1-2-1',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Child three',
                content: 'Child three'
            },
        },
        '1-2-2': {
            id: '1-2-2',
            children: ['1-2-2-1'],
            hasChildren: false,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: 'Child four',
            },
        },
        '1-3-1': {
            id: '1-3-1',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Child five',
                content: 'Child five'
            },
        },
        '1-3-2': {
            id: '1-3-2',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Child six',
                content: 'Child six'
            },
        },
        '1-2-2-1': {
            id: '1-2-2-1',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Child four child 1',
                content: 'Child four child 1'
            },
        },
    },
};
