import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from '../Icon/Icon';

function LayoutPreset({
  onSelection = () => {},
  title,
  icon,
  commandOptions,
  classNames: classNameProps,
  disabled,
}) {
  return (
    <div
      className={classNames(classNameProps, disabled && 'ohif-disabled')}
      onClick={() => {
        onSelection(commandOptions);
      }}
      data-cy={title}
    >
      <Icon
        name={icon}
        className=""
      />
      {title && (
        <div className="font-inter text-button text-sm group-hover:text-white">{title}</div>
      )}
    </div>
  );
}

LayoutPreset.propTypes = {
  onSelection: PropTypes.func.isRequired,
  title: PropTypes.string,
  icon: PropTypes.string.isRequired,
  commandOptions: PropTypes.object.isRequired,
  classNames: PropTypes.string,
  disabled: PropTypes.bool,
};

export default LayoutPreset;
