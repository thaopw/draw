import styled from 'styled-components';

// min-width, so it can have text overflow

const Table = styled.table`
  margin: 0 5px 10px;
  width: 150px;
  min-width: 0;
  table-layout: fixed;
  border-left: var(--border);
  border-right: var(--border);
  border-spacing: 0;
  border-collapse: collapse;

  @media (max-width: 999px) {
    margin: 0 3px 6px;
    width: max-content;
  }

  tr {
    border: var(--border);
  }
`;

export default Table;
