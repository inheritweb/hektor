# UI package guidance

Read and follow `/COMPONENTS.md` before changing this package.

Keep dependencies flowing in this direction:

`pages -> templates -> organisms -> molecules -> atoms`

Every visible component requires a Storybook story grouped under its atomic
layer. UI components receive application data and behavior through props.
