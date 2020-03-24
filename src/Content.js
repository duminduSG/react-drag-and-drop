import React from 'react';

const Content = props => {
  const { node } = props;
  return (
      <div>{ node && node.data.content ? node.data.content : '' }</div>
  )
};

export default Content;
