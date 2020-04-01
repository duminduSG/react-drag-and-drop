import React from 'react';
import ArrowLeft from '@atlaskit/icon/glyph/arrow-left-circle';
import ArrowRight from '@atlaskit/icon/glyph/arrow-right-circle';

const Content = props => {
  const { node } = props;
  return (
      <div>{ node && node.data.content ?
          (<div>
            <ArrowLeft/>
            <div>{node.data.content}</div>
            <ArrowRight/>
          </div>)
          : null }
      </div>
  )
};

export default Content;
