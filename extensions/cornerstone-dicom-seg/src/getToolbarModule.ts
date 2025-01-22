export function getToolbarModule({ servicesManager }: withAppTypes) {
  const { segmentationService, toolbarService, toolGroupService } = servicesManager.services;
  return [
    {
      name: 'evaluate.cornerstone.segmentation',
      evaluate: ({ viewportId, button, toolNames, disabledText }) => {
        // Todo: we need to pass in the button section Id since we are kind of
        // forcing the button to have black background since initially
        // it is designed for the toolbox not the toolbar on top
        // we should then branch the buttonSectionId to have different styles
        const segmentations = segmentationService.getSegmentationRepresentations(viewportId);
        if (!segmentations?.length) {
          return {
            disabled: true,
            className: '!text-button-disabled !bg-secondary opacity-50',
            disabledText: disabledText ?? 'No segmentations available',
          };
        }

        const toolGroup = toolGroupService.getToolGroupForViewport(viewportId);

        if (!toolGroup) {
          return {
            disabled: true,
            className: '!text-button-disabled ohif-disabled',
            disabledText: disabledText ?? 'Not available on the current viewport',
          };
        }

        const toolName = toolbarService.getToolNameForButton(button);

        if (!toolGroup.hasTool(toolName) && !toolNames) {
          return {
            disabled: true,
            className: '!text-button-disabled ohif-disabled',
            disabledText: disabledText ?? 'Not available on the current viewport',
          };
        }

        const isPrimaryActive = toolNames
          ? toolNames.includes(toolGroup.getActivePrimaryMouseButtonTool())
          : toolGroup.getActivePrimaryMouseButtonTool() === toolName;

        return {
          disabled: false,
          className: isPrimaryActive
            ? '!text-white !bg-primary hover:bg-primary hover:cursor-pointer'
            : '!text-button !bg-secondary hover:bg-primary hover:cursor-pointer hover:text-white',
          // Todo: isActive right now is used for nested buttons where the primary
          // button needs to be fully rounded (vs partial rounded) when active
          // otherwise it does not have any other use
          isActive: isPrimaryActive,
        };
      },
    },
  ];
}
