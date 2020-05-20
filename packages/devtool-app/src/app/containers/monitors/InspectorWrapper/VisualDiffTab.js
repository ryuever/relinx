import React, { Component, PropTypes } from 'react';
import { format } from 'jsondiffpatch';
import styled from 'styled-components';

export const StyledContainer = styled.div`
  .jsondiffpatch-delta {
    font-family: monaco, Consolas, "Lucida Console", monospace;
    font-size: 12px;
    padding: 12px;
    margin: 0;
    display: inline-block;
  }

  .jsondiffpatch-delta pre {
    font-family: monaco, Consolas, "Lucida Console", monospace;
    font-size: 12px;
    margin: 0;
    padding: 2px 3px;
    border-radius: 3px;
    position: relative;
    color: #FFFFFF;
    display: inline-block;
  }

  ul.jsondiffpatch-delta {
    list-style-type: none;
    padding: 0 0 0 20px;
    margin: 0;
  }

  .jsondiffpatch-delta ul {
    list-style-type: none;
    padding: 0 0 0 20px;
    margin: 0;
  }

  .jsondiffpatch-left-value, .jsondiffpatch-right-value {
    vertical-align: top;
  }

  .jsondiffpatch-modified .jsondiffpatch-right-value:before {
    vertical-align: top;
    padding: 2px;
    color: #D381C3;
    content: ' => ';
  }

  .jsondiffpatch-added .jsondiffpatch-value pre,
  .jsondiffpatch-modified .jsondiffpatch-right-value pre,
  .jsondiffpatch-textdiff-added {
    background: rgba(161, 198 ,89, 0.4);
  }

  .jsondiffpatch-deleted pre,
  .jsondiffpatch-modified .jsondiffpatch-left-value pre,
  .jsondiffpatch-textdiff-deleted {
    background: rgba(251, 159 ,177, 0.4);
    text-decoration: line-through;
  }

  .jsondiffpatch-unchanged,
  .jsondiffpatch-movedestination {
    color: gray;
  }

  .jsondiffpatch-unchanged,
  .jsondiffpatch-movedestination > .jsondiffpatch-value {
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    overflow-y: hidden;
  }

  .jsondiffpatch-unchanged-showing .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-showing .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 100px;
  }

  .jsondiffpatch-unchanged-hidden .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 0;
  }

  .jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value,
  .jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
    display: block;
  }

  .jsondiffpatch-unchanged-visible .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-visible .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 100px;
  }

  .jsondiffpatch-unchanged-hiding .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 0;
  }

  .jsondiffpatch-unchanged-showing .jsondiffpatch-arrow,
  .jsondiffpatch-unchanged-hiding .jsondiffpatch-arrow {
    display: none;
  }

  .jsondiffpatch-value {
    display: inline-block;
  }

  .jsondiffpatch-property-name {
    display: inline-block;
    padding: 2px 0;
    padding-right: 5px;
    vertical-align: top;
    color: rgb(111, 179, 210);
  }

  .jsondiffpatch-property-name:after {
    content: ': ';
    color: #FFFFFF;
  }

  .jsondiffpatch-child-node-type-array > .jsondiffpatch-property-name:after {
    content: ': [';
  }

  .jsondiffpatch-child-node-type-array:after {
    content: '],';
  }

  div.jsondiffpatch-child-node-type-array:before {
    content: '[';
  }

  div.jsondiffpatch-child-node-type-array:after {
    content: ']';
  }

  .jsondiffpatch-child-node-type-object > .jsondiffpatch-property-name:after {
    content: ': {';
  }

  .jsondiffpatch-child-node-type-object:after {
    content: '},';
  }

  div.jsondiffpatch-child-node-type-object:before {
    content: '{';
  }

  div.jsondiffpatch-child-node-type-object:after {
    content: '}';
  }

  .jsondiffpatch-value pre:after {
    color: #FFFFFF;
    content: ',';
  }

  li:last-child > .jsondiffpatch-value pre:after,
  .jsondiffpatch-modified > .jsondiffpatch-left-value pre:after {
    content: '';
  }

  .jsondiffpatch-modified .jsondiffpatch-value {
    display: inline-block;
  }

  .jsondiffpatch-modified .jsondiffpatch-right-value {
    margin-left: 5px;
  }

  .jsondiffpatch-moved .jsondiffpatch-value {
    display: none;
  }

  .jsondiffpatch-moved .jsondiffpatch-moved-destination {
    display: inline-block;
    background: #ffffbb;
    color: #888;
  }

  .jsondiffpatch-moved .jsondiffpatch-moved-destination:before {
    content: ' => ';
  }

  ul.jsondiffpatch-textdiff {
    padding: 0;
  }

  .jsondiffpatch-textdiff-location {
    color: #bbb;
    display: inline-block;
    min-width: 60px;
  }

  .jsondiffpatch-textdiff-line {
    display: inline-block;
  }

  .jsondiffpatch-textdiff-line-number:after {
    color: #FFFFFF;
    content: ',';
  }

  .jsondiffpatch-error {
    background: red;
    color: white;
    font-weight: bold;
  }
`;

export default class VisualDiffTab extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }

  render() {
    let __html;
    const data = this.props.data;
    if (data) {
      __html = format(data);
    }

    return <StyledContainer dangerouslySetInnerHTML={{ __html }} />;
  }
}

VisualDiffTab.propTypes = {
  data: PropTypes.object
};