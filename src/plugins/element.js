import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, Container, Aside, Main, Header, Menu, Submenu, MenuItem, MenuItemGroup, Breadcrumb, BreadcrumbItem, Card, Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox, Tag, Tree, Select, Option, Cascader, Alert, Tabs, TabPane, Step, Steps, Checkbox, CheckboxGroup, Upload, Timeline, TimelineItem } from 'element-ui'

Vue.use(Button).use(Form).use(FormItem).use(Input).use(Container).use(Aside)
  .use(Main).use(Header).use(Menu).use(Submenu).use(MenuItem).use(MenuItemGroup)
  .use(Breadcrumb).use(BreadcrumbItem).use(Card).use(Row).use(Col).use(Table)
  .use(TableColumn).use(Switch).use(Tooltip).use(Pagination).use(Dialog).use(Tag)
  .use(Tree).use(Select).use(Option).use(Cascader).use(Alert).use(Tabs).use(TabPane)
  .use(Step).use(Steps).use(Checkbox).use(CheckboxGroup).use(Upload).use(Timeline)
  .use(TimelineItem)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
