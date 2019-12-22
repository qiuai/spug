import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Table, Divider, Modal, Icon, Popover, message } from 'antd';
import http from 'libs/http';
import store from './store';
import { LinkButton } from "components";

@observer
class ComTable extends React.Component {
  componentDidMount() {
    store.fetchRecords()
  }

  columns = [{
    title: '申请标题',
    dataIndex: 'name',
  }, {
    title: '应用',
    dataIndex: 'app_name',
  }, {
    title: '发布环境',
    dataIndex: 'env_name',
  }, {
    title: '版本',
    render: info => {
      if (info['app_extend'] === '1') {
        const [type, ext1, ext2] = info.extra;
        if (type === 'branch') {
          return <React.Fragment>
            <Icon type="branches"/> {ext1}#{ext2.substr(0, 6)}
          </React.Fragment>
        } else {
          return <React.Fragment>
            <Icon type="tag"/> {ext1}
          </React.Fragment>
        }
      } else {
        return <React.Fragment>
          <Icon type="build"/> xxx
        </React.Fragment>
      }
    }
  }, {
    title: '状态',
    render: info => {
      if (info.status === '-1' && info.reason) {
        return <Popover title="驳回原因:" content={info.reason}>
          <span style={{color: '#1890ff'}}>{info['status_alias']}</span>
        </Popover>
      } else if (info.status === '2' && info.reason) {
        return <Popover title="审核意见:" content={info.reason}>
          <span style={{color: '#1890ff'}}>{info['status_alias']}</span>
        </Popover>
      } else {
        return info['status_alias']
      }
    }
  }, {
    title: '申请人',
    dataIndex: 'created_by_user',
  }, {
    title: '申请时间',
    dataIndex: 'created_at'
  }, {
    title: '操作',
    render: info => {
      switch (info.status) {
        case '-3':
        case '3':
          return <LinkButton onClick={() => store.showForm(info)}>回滚</LinkButton>;
        case '-1':
          return <React.Fragment>
            <LinkButton onClick={() => store.showForm(info)}>编辑</LinkButton>
            <Divider type="vertical"/>
            <LinkButton onClick={() => this.handleDelete(info)}>删除</LinkButton>
          </React.Fragment>;
        case '1':
          return <React.Fragment>
            <LinkButton onClick={() => store.showApprove(info)}>审核</LinkButton>
            <Divider type="vertical"/>
            <LinkButton onClick={() => store.showForm(info)}>编辑</LinkButton>
            <Divider type="vertical"/>
            <LinkButton onClick={() => this.handleDelete(info)}>删除</LinkButton>
          </React.Fragment>
        case '2':
          return <React.Fragment>
            <Link to={`/deploy/do/${info.id}`}>发布</Link>
            <Divider type="vertical"/>
            <LinkButton onClick={() => this.handleDelete(info)}>删除</LinkButton>
          </React.Fragment>;
        default:
          return null
      }
    }
  }];

  handleDelete = (text) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${text['name']}】?`,
      onOk: () => {
        return http.delete('/api/exec/template/', {params: {id: text.id}})
          .then(() => {
            message.success('删除成功');
            store.fetchRecords()
          })
      }
    })
  };

  render() {
    let data = store.records;
    if (store.f_name) {
      data = data.filter(item => item['name'].toLowerCase().includes(store.f_name.toLowerCase()))
    }
    if (store.f_app_name) {
      data = data.filter(item => item['app_name'].toLowerCase().includes(store.f_app_name.toLowerCase()))
    }
    return (
      <Table rowKey="id" loading={store.isFetching} dataSource={data} columns={this.columns}/>
    )
  }
}

export default ComTable