import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DragAndDropSyllabus, {
  DragAndDropSyllabusProps,
} from "../components/NewSyllabus/DragAndDropSyllabus";

export default {
  component: DragAndDropSyllabus,
  title: "NewSyllabus/DragAndDropSyllabus",
} as ComponentMeta<typeof DragAndDropSyllabus>;

const Template: ComponentStory<typeof DragAndDropSyllabus> = (
  args: DragAndDropSyllabusProps
) => <DragAndDropSyllabus {...args} />;

export const Default = Template.bind({});
Default.args = {
  onSyllabusUpload: () => {},
};
