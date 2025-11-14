export default defineAppConfig({
  ui: {
    colors: {
      primary: 'white-rock',
      neutral: 'slate'
    },
    input: {
      slots: {
        root: 'w-full'
      }
    },
    inputTags: {
      slots: {
        root: 'w-full'
      }
    },
    inputNumber: {
      slots: {
        root: 'w-full'
      }
    },
    textarea: {
      slots: {
        root: 'w-full'
      }
    }
  },
  global: {
    header: {
      menu: {
        columns: [
          {
            label: 'Home',
            to: '/'
          },
          {
            label: 'About Us',
            to: '/about-us',
            // active: route.path.startsWith('/docs')
          }, 
          {
            label: 'Sermon',
            to: '#'
          },
          {
            label: 'Community',
            to: '#'
          },
          {
            label: 'Blog',
            to: '/blog'
          },
          {
            label: 'Contact',
            to: '/contact'
          }
        ]
      }
    },
    footer: {
      columns: [
        {
          label: 'Quicklinks',
          children: [
            {
              label: 'Events',
              to: '/event'
            }, 
            {
              label: 'Gallery',
              to: '/gallery'
            }, 
            {
              label: 'Blog'
            }, 
            {
              label: 'Sermons'
            }
          ]
        }, 
        {
          label: 'Resources',
          children: [
            {
              label: 'Sunday School'
            },
            {
              label: 'Books'
            },
            {
              label: 'Opportunities'
            }, 
            {
              label: 'Sponsorship'
            }
          ]
        }
      ]
    }
  }
})
