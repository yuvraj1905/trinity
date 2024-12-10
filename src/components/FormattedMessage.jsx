import { Box, Typography, Paper, IconButton, Chip, Card, Tooltip } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import HttpIcon from '@mui/icons-material/Http';
import ApiIcon from '@mui/icons-material/Api';

const FormattedMessage = ({ content }) => {
  const formatEndpoint = (endpoint) => {
    const [method, path] = endpoint.split(' ');
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
        <Chip 
          icon={<HttpIcon />}
          label={method}
          size="small"
          color={
            method === 'GET' ? 'success' :
            method === 'POST' ? 'primary' :
            method === 'PUT' ? 'warning' :
            method === 'DELETE' ? 'error' : 'default'
          }
          sx={{ 
            fontWeight: 600,
            px: 1,
            '& .MuiChip-icon': { fontSize: 16 }
          }}
        />
        <Box
          sx={{ 
            fontFamily: 'monospace', 
            fontSize: '0.9rem',
            bgcolor: 'grey.100',
            px: 2,
            py: 0.75,
            borderRadius: 1,
            color: 'grey.800'
          }}
        >
          {path}
        </Box>
      </Box>
    );
  };

  const formatCodeBlock = (content, language = 'json') => {
    return (
      <Box sx={{ position: 'relative', my: 2 }}>
        <Paper 
          elevation={0}
          sx={{ 
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: '#1E1E1E'
          }}
        >
          <Box sx={{ 
            px: 2, 
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'grey.800',
            bgcolor: '#2D2D2D'
          }}>
            <Typography sx={{ 
              color: 'grey.400',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              {language}
            </Typography>
            <Tooltip title="Copy code">
              <IconButton
                size="small"
                onClick={() => navigator.clipboard.writeText(content)}
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
              backgroundColor: 'transparent'
            }}
          >
            {content}
          </SyntaxHighlighter>
        </Paper>
      </Box>
    );
  };

  const EndpointChip = ({ method, path }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2 }}>
      <Chip 
        icon={<HttpIcon />}
        label={method}
        size="small"
        color={
          method === 'GET' ? 'success' :
          method === 'POST' ? 'primary' :
          method === 'PUT' ? 'warning' :
          method === 'DELETE' ? 'error' : 'default'
        }
        sx={{ 
          fontWeight: 600,
          px: 1.5,
          '& .MuiChip-icon': { fontSize: 16 }
        }}
      />
      <Box
        sx={{ 
          fontFamily: 'monospace', 
          fontSize: '0.9rem',
          bgcolor: 'grey.100',
          px: 2.5,
          py: 1,
          borderRadius: 1,
          color: 'grey.800'
        }}
      >
        {path}
      </Box>
    </Box>
  );

  const CodeBlock = ({ content, language }) => (
    <Box sx={{ position: 'relative', my: 2.5 }}>
      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: '#1E1E1E'
        }}
      >
        <Box sx={{ 
          px: 2, 
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'grey.800',
          bgcolor: '#2D2D2D'
        }}>
          <Typography sx={{ 
            color: 'grey.400',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontWeight: 500
          }}>
            {language}
          </Typography>
          <Tooltip title="Copy code">
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(content);
                // Optional: Add a success toast here
              }}
              sx={{ 
                color: 'grey.400',
                '&:hover': {
                  color: 'grey.100'
                }
              }}
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
            backgroundColor: 'transparent'
          }}
        >
          {content}
        </SyntaxHighlighter>
      </Paper>
    </Box>
  );

  const formatApiSection = (title, content) => (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          color: 'grey.800', 
          fontWeight: 600,
          fontSize: '1.1rem'
        }}
      >
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: 'grey.700', lineHeight: 1.6 }}>
        {content}
      </Typography>
    </Box>
  );

  const formatStep = (number, title, content) => (
    <Box sx={{ mb: 2 }}>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 600,
          color: 'grey.800',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1
        }}
      >
        <Box 
          component="span" 
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem'
          }}
        >
          {number}
        </Box>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: 'grey.700', ml: 4 }}>
        {content}
      </Typography>
    </Box>
  );

  const formatSection = (line) => {
    const headerLevel = line.match(/^#+/)[0].length;
    return (
      <Typography
        variant={headerLevel === 3 ? 'h5' : 'h6'}
        sx={{
          mt: headerLevel === 3 ? 4 : 2,
          mb: 2,
          fontWeight: 600,
          color: 'grey.800'
        }}
      >
        {line.replace(/^#+\s/, '')}
      </Typography>
    );
  };

  const formatNumberedStep = (line) => {
    const match = line.match(/^(\d+)\.\s\*\*([^*]+)\*\*(.+)?$/);
    if (!match) return null;
    
    const [_, number, title, content] = match;
    return formatStep(number, title, content?.trim() || '');
  };

  return (
    <Box>
      {content.split('\n').map((line, index) => {
        // Handle headers (###)
        if (line.match(/^#{2,3}/)) {
          return formatSection(line);
        }

        // Handle numbered steps with bold titles
        if (line.match(/^\d+\.\s\*\*/)) {
          return formatNumberedStep(line);
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

        // Handle regular text
        if (line.trim()) {
          return (
            <Typography 
              key={index}
              variant="body1" 
              sx={{ 
                mb: 1.5,
                color: 'grey.700',
                lineHeight: 1.7
              }}
            >
              {line}
            </Typography>
          );
        }

        return null;
      }).filter(Boolean)}
    </Box>
  );
};

export default FormattedMessage;