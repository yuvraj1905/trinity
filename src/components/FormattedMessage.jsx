import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTheme } from '@mui/material/styles';

const FormattedMessage = ({ content }) => {
  const theme = useTheme();

  const formatCodeBlock = (codeContent, language = 'json') => (
    <Box sx={{ my: 3 }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#1E1E1E',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: '#2D2D2D',
          }}
        >
          <Typography
            sx={{
              color: 'grey.400',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {language}
          </Typography>
          <Tooltip title="Copy code">
            <IconButton
              size="small"
              onClick={() => navigator.clipboard.writeText(codeContent)}
              sx={{ color: 'grey.400' }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '0.85rem',
            backgroundColor: 'transparent',
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </Paper>
    </Box>
  );

  const formatInlineCode = (text) =>
    text.split(/`([^`]+)`/).map((segment, i) =>
      i % 2 === 1 ? (
        <Typography
          key={i}
          component="span"
          sx={{
            fontFamily: 'monospace',
            bgcolor: 'grey.200',
            px: 0.5,
            borderRadius: 0.5,
            color: theme.palette.text.primary,
          }}
        >
          {segment}
        </Typography>
      ) : (
        segment
      )
    );

  const formatBlockquote = (text) => (
    <Box
      sx={{
        pl: 2,
        py: 1,
        mb: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        bgcolor: 'grey.100',
      }}
    >
      <Typography variant="body1" sx={{ color: 'grey.700', fontStyle: 'italic' }}>
        {text.replace(/^>\s*/, '')}
      </Typography>
    </Box>
  );

  const formatHeading = (line) => {
    const level = line.match(/^#+/)[0].length;
    const fontSize = level === 2 ? '1.5rem' : '1.25rem';
    return (
      <Typography
        variant="h6"
        sx={{
          mt: 3,
          mb: 2,
          fontWeight: 600,
          fontSize,
          color: theme.palette.text.primary,
        }}
      >
        {line.replace(/^#+\s*/, '')}
      </Typography>
    );
  };

  const formatListItem = (line, isOrdered) => (
    <Box
      component="li"
      sx={{
        ml: isOrdered ? 3 : 2,
        mb: 1,
        listStyleType: isOrdered ? 'decimal' : 'disc',
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
        {formatInlineCode(line.replace(/^\d+\.\s*|\*\s*/, ''))}
      </Typography>
    </Box>
  );

  return (
    <Box>
      {content.split('\n').map((line, index) => {
        // Handle headings
        if (line.match(/^#{2,3}/)) {
          return formatHeading(line);
        }

        // Handle blockquotes
        if (line.startsWith('>')) {
          return formatBlockquote(line);
        }

        // Handle ordered lists
        if (line.match(/^\d+\.\s/)) {
          return formatListItem(line, true);
        }

        // Handle unordered lists
        if (line.match(/^\*\s/)) {
          return formatListItem(line, false);
        }

        // Handle code blocks
        if (line.trim().startsWith('```')) {
          const language = line.trim().replace('```', '');
          const codeContent = content
            .split(line)[1]
            .split('```')[0]
            .trim();
          return formatCodeBlock(codeContent, language);
        }

        // Handle regular text and inline code
        if (line.trim()) {
          return (
            <Typography
              key={index}
              variant="body1"
              sx={{
                mb: 1.5,
                color: theme.palette.text.primary,
                lineHeight: 1.7,
              }}
            >
              {formatInlineCode(line)}
            </Typography>
          );
        }

        return null;
      })}
    </Box>
  );
};

export default FormattedMessage;
